import { AuthType, createClient } from "webdav";
const client = createClient(`http://127.0.0.1:3000/https://dav.jianguoyun.com/dav/`, {
  authType: AuthType.Password,
  username: process.env.JGY_USER,
  password: process.env.JGY_PWD,
});
(window as any)["client"] = client;

export class SyncManager {
  async sync() {
    const exists = await client.exists("memo");
    if (!exists) {
      const created = await client.createDirectory("memo");
      console.log("created", created);
    }
    console.log("exists", exists);
  }
}
