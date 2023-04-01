import { Field, Kv } from '../lib/kv'

class Store extends Kv {
  lastState = new Field<{ loop: boolean; time: number }>(this, 'lastState')
}

export const store = new Store()
