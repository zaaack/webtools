import { AuthType, createClient } from "webdav";
import { Kv } from "../../lib/kv";
import { db, Image, Note } from "../db";
import { kv, SyncInfo } from "../kv";
import { remoteDb } from "./remote-db";

export interface Note100 {
  data: Exclude<Note, "content">[];
}

export interface NoteImages {
  data: Image[];
}
 class SyncHelper {
  updateNoteSyncInfo(note: Note) {
    if (!note.id) throw new Error(`invalid note.id`);
    let id100 = Math.floor(note.id / 100);
    const noteFile = remoteDb.note100Filename(id100);
    let imgFile = remoteDb.noteImagesFilename(note.id);
    let syncInfo = kv.syncInfo.get({ fileStates: {} });
    [noteFile].forEach((f) => {
      let fs = syncInfo.fileStates[f];
      if (!fs) {
        fs = syncInfo.fileStates[f] = { updatedAt: "" };
      }
      fs.updatedAt = new Date().toISOString();
    });
    kv.syncInfo.set(syncInfo);
  }
  async sync() {
    const client = remoteDb.client
    const exists = await client.exists("memo");
    if (!exists) {
      const created = await client.createDirectory("memo");
      console.log("created", created);
    }

    // 储存冲突笔记最后添加避免id冲突
    const conflictNotes: Note[] = [];
    let lock = await client.lock("/memo");
    console.info("lock", lock);
    try {
      const localSyncInfo = kv.syncInfo.get();
      if (!localSyncInfo) return;
      let remoteSyncInfo = await remoteDb.getSyncInfo();
      if (!Object.keys(remoteSyncInfo.fileStates).length) {
        remoteDb.setSyncInfo(localSyncInfo);
      }

      for (const k in localSyncInfo.fileStates) {
        const s = localSyncInfo.fileStates[k];
        const rs = remoteSyncInfo.fileStates[k];
        if (k.startsWith("note_")) {
          const id100 = Number(k.match(/note_(\d+)/)?.[1] || -1);
          if (id100 < 0) throw Error("invalid note id100");
          const remoteNote100 = await remoteDb.getNote100(id100);
          const remoteNote100Map = new Map(
            remoteNote100.data.map((d) => [d.id, d])
          );
          // 本地有更新
          if (!s.syncedAt || new Date(s.updatedAt) > new Date(s.syncedAt)) {
            const localNote100 = await db.notes
              .where("id")
              .between(id100 + 1, id100 + 100, true, true)
              .toArray();
            const localNote100Map = new Map(localNote100.map((n) => [n.id, n]));
            // 服务端无更新, 直接用本地覆盖服务端
            if (!rs || s.syncedAt === rs.syncedAt) {
              for (const n of localNote100) {
                let rn = remoteNote100Map.get(n.id!);
                if (rn) {
                  // 图片有更新
                  remoteDb.updateRemoteImages(n, rn);
                }
                remoteNote100.data = localNote100;
              }
              // 服务端有更新
            } else {
              for (let i = id100 + 1; i <= id100 + 100; i++) {
                let n = localNote100Map.get(i)!; // 笔记一直存在，即使删除也有fake note 储存删除信息
                let rn = remoteNote100Map.get(i);
                if (
                  !rn ||
                  (rn.syncedAt === n.syncedAt && n.updatedAt > n.syncedAt!)
                ) {
                  // 服务端无更新且本地有更新, 直接覆盖服务端
                  remoteNote100Map.set(i, n);
                  remoteDb.updateRemoteImages(n, rn);
                } else if (rn && n.updatedAt === rn.updatedAt) {
                  // 本地和服务端一致，跳过
                  continue;
                } else if (
                  !n ||
                  (n.syncedAt &&
                    n.syncedAt < rn.syncedAt! &&
                    n.updatedAt <= n.syncedAt)
                ) {
                  // 服务端有更新, 本地无笔记或者笔记上次更新后未修改，可以直接更新本地
                  remoteDb.updateLocalNoteAndImages(rn, n);
                } else if (
                  !n.syncedAt ||
                  (n.syncedAt < rn.syncedAt! && n.updatedAt > n.syncedAt)
                ) {
                  // 服务端有更新，本地有笔记且有未同步修改，以较新版为准，创建冲突笔记
                  // final note, conflict note
                  let [fn, cn] = rn.updatedAt > n.updatedAt ? [rn, n] : [n, rn];
                  await db.notes.update(fn.id!, fn);
                  remoteNote100Map.set(fn.id!, fn);

                  // 储存冲突笔记放最后添加
                  conflictNotes.push(cn);
                  // 将服务端笔记的图片同步到本地
                  let rImages = await remoteDb.getNoteImages(rn.id!);
                  for (const i of rImages.data) {
                    let exists =
                      (await db.images.where("id").equals(i.id).count()) > 0;
                    if (!exists) {
                      await db.images.add(i);
                    }
                  }
                  // 更新服务端图片
                  await remoteDb.updateRemoteImages(fn, rn);
                }
              }

              for (const cn of conflictNotes) {
                cn.id = void 0;
                cn.createdAt = new Date();
                cn.updatedAt = new Date();
                cn.syncedAt = void 0;
                cn.id = (await db.notes.add(cn)) as number;
                this.updateNoteSyncInfo(cn);
              }
            }

            let now = new Date();
            localNote100.forEach((n) => (n.syncedAt = now));
            await db.notes.bulkPut(localNote100);
            remoteNote100.data = Array.from(remoteNote100Map.values());
            await client.putFileContents(k, JSON.stringify(remoteNote100));
            localSyncInfo.fileStates[k].syncedAt = now.toISOString();
            remoteSyncInfo.fileStates[k].syncedAt = now.toISOString();
            kv.syncInfo.set(localSyncInfo);
            await remoteDb.setSyncInfo(remoteSyncInfo);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      await client.unlock("/memo", lock.token);
      // 同步新创建的冲突笔记
      if (conflictNotes.length) {
        await this.sync();
      }
    }
  }
}

export const syncHelper = new SyncHelper()
