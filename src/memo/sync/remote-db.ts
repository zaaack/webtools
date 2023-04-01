import { AuthType, createClient, WebDAVClient } from "webdav";
import { Kv } from "../../lib/kv";
import { db, Image, Note } from "../db";
import { kv, SyncInfo } from "../kv";
import { Note100, NoteImages } from "./sync-helper";
console.log("PASS", process.env.JGY_USER, process.env.JGY_PASS);

class RemoteDB {
  private _client?: WebDAVClient;
  get client() {
    if (!this._client)
      this._client = createClient(
        `http://127.0.0.1:3000/https://dav.jianguoyun.com/dav/`,
        {
          authType: AuthType.Password,
          username: process.env.JGY_USER,
          password: process.env.JGY_PASS,
        }
      );
    return this._client;
  }
  private async _tryGetJson<T>(fn: string, defaults: T) {
    try {
      let rf = await this.client.getFileContents(fn, { format: "text" });
      return JSON.parse(rf as string) as T;
    } catch (err) {
      return defaults;
    }
  }
  note100Filename(id100: number) {
    return `note_${id100 + 1}-${id100 + 100}.json`;
  }
  noteImagesFilename(id: number) {
    return `/memo/noteImages_${id}.json`;
  }
  async getSyncInfo() {
    return this._tryGetJson<SyncInfo>(`/memo/syncInfo.json`, {
      fileStates: {},
    });
  }
  async setSyncInfo(info: SyncInfo) {
    return this.client.putFileContents(`/memo/syncInfo.json`, JSON.stringify(info));
  }
  async getNoteImages(id: number) {
    return this._tryGetJson<NoteImages>(
      "/memo/" + this.noteImagesFilename(id),
      { data: [] }
    );
  }
  async getNote100(id100: number) {
    return this._tryGetJson<Note100>("/memo/" + this.note100Filename(id100), {
      data: [],
    });
  }
  async setNoteImages(id: number, ni: NoteImages) {
    return this.client.putFileContents(
      "/memo/" + this.noteImagesFilename(id),
      JSON.stringify(ni)
    );
  }
  async updateRemoteImages(ln: Note, rn?: Note) {
    if (!rn || rn.images.join(",") !== ln.images.join(",")) {
      let images = await db.images.where("id").anyOf(ln.images).toArray();
      let noteImages: NoteImages = {
        data: images,
      };
      await remoteDb.setNoteImages(ln.id!, noteImages);
    }
  }
  async updateLocalNoteAndImages(rn: Note, ln?: Note) {
    if (!ln) {
      let images = await remoteDb.getNoteImages(rn.id!);
      await db.images.bulkAdd(images.data);
      await db.notes.add(rn);
    } else {
      await db.notes.update(rn.id!, rn);
      let images = await remoteDb.getNoteImages(rn.id!);
      let localImages = await db.images
        .where("noteId")
        .anyOf(ln.images)
        .toArray();
      let localDeletes: string[] = [];
      let localAdds: Image[] = [];
      for (const img of localImages) {
        if (!images.data.some((d) => d.id === img.id)) {
          localDeletes.push(img.id);
        }
      }
      for (const img of images.data) {
        if (!localImages.some((d) => d.id === img.id)) {
          localAdds.push(img);
        }
      }
      await db.images.bulkDelete(localDeletes);
      await db.images.bulkAdd(localAdds);
    }
  }
  async setNote100(id100: number, note100: Note100) {
    return this.client.putFileContents(
      "/memo/" + this.note100Filename(id100),
      JSON.stringify(note100)
    );
  }
}

export const remoteDb = new RemoteDB();
