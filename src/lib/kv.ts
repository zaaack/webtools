import { defaults as _defaults } from './defaults'

export interface KvOptions {
  expire?: number
}

/**
 * 基于 localStorage 的本地存储封装类
 * - try/catch 包裹 localStorage
 * - get 时支持设置默认值
 * - set/get 时自动使用 JSON 编解码
 * - 友好的类型支持
 *
 * @example
 * ```ts
 * type UserInfo = { id: string, name: string }
 * class MyStore extends Kv {
 *   userInfo = new Field<UserInfo>(this, 'userInfo')
 * }
 * const ms = new MyStore()
 * const userInfo = ms.userInfo.get()
 * userInfo.name = 'aa'
 * ms.userInfo.set(userInfo)
 * ms.userInfo.remove()
 * ```
 */
export class Kv {
  get<T = any>(key: string): T | undefined
  get<T = any>(key: string, defaults: T): T
  get<T = any>(key: string, defaults?: T): T | undefined {
    try {
      const store = localStorage.getItem(key)
      if (store) {
        const meta = JSON.parse(store)
        if (meta && meta.expire && Date.now() > meta.expire) {
          this.remove(key)
          return defaults
        }
        return _defaults(meta.data, defaults)
      }
      return defaults
    } catch (error) {
      console.warn(`cannot get key:${key}`, error)
      return defaults
    }
  }

  set<T>(key: string, val: T, options?: KvOptions) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...options,
          data: val,
        }),
      )
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(error)
    }
  }
}

/**
 * 封装了 Kv 对于某个 key 的读写删操作，可以作为自定义Kv类的属性
 */
export class Field<T = any> {
  constructor(private _kv: Kv, private _key: string, private _defaults?: T) {}

  get(): T | undefined
  get(defaults: T): T
  get(defaults: T | undefined = this._defaults): T | undefined {
    return this._kv.get(this._key, defaults)
  }
  set(val: T, options?: KvOptions) {
    return this._kv.set(this._key, val, options)
  }
  remove() {
    return this._kv.remove(this._key)
  }
}
