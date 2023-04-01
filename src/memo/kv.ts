import { Field, Kv } from '../lib/kv';
// note_1-100.json
// note_101-200.json
// ...
// categories.json
// noteImages_<noteId>.json
export interface SyncInfo {
  fileStates: Record<string, {
    updatedAt: string,
    syncedAt?: string,
  }>,
}
class MemoKv extends Kv {
  syncInfo = new Field<SyncInfo>(this, 'syncInfo')
}

export const kv = new MemoKv()
