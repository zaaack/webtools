import Dexie, { Table } from 'dexie';

export interface Note {
  id?: number
  categoryId: number
  title: string
  content: string
  syncedAt?: Date
  createdAt: Date
  updatedAt: Date
  trashedAt?: Date // 放到回收站
  removedAt?: Date //彻底删除
  images: number[]
}

export interface Category {
  id?: number
  title: string
  syncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Image{
  id: string
  url: string
  noteId: number
  syncedAt?: Date
  removedAt?: Date
}

export class MemoDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  notes!: Table<Note>;
  categories!: Table<Category>
  images!: Table<Image>

  constructor() {
    super('memo');
    this.version(1).stores({
      notes: '++id, title, categoryId, createdAt,updatedAt,deletedAt', // Primary key and indexed props
      categories: '++id, title',
      images: 'id, noteId'
    });
  }
}

export const db = new MemoDB();
