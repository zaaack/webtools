import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { store } from "./store";
import { Button, Checkbox, Picker } from "antd-mobile";
import css from "./index.module.scss";
if (window.Notification) {
  Notification.requestPermission();
}
export interface Props {}

let clearTimer: () => void;

function startTimer(data: { loop: boolean; time: number }) {
  store.lastState.set(data);
  let set = data.loop ? setInterval : setTimeout;
  let clear = data.loop ? clearInterval : clearTimeout;
  clearTimer && clearTimer();
  let start = Date.now();
  let timer = set(() => {
    self.postMessage(JSON.stringify({ type: "log", data: "noti" }));
    console.log("noti");
    try {
      navigator.serviceWorker
        .getRegistration("./sw.js")
        .then((reg) => {
          reg?.showNotification(
            "倒计时提醒：" + `${data.loop ? "循环" : ""}${data.time}分钟`,
            {}
          );
        })
        .catch((err) => {
          self.postMessage(JSON.stringify({ type: "log", data: err.message }));
        });
    } catch (error: any) {
      self.postMessage(JSON.stringify({ type: "log", data: error.message }));
    }
    try {
      const audio = new Audio(
        `${process.env.NODE_ENV === "development" ? "" : "/webtools"}/noti.mp3`
      );
      audio.load();
      audio.play();
    } catch (error: any) {
      self.postMessage(JSON.stringify({ type: "log", data: error.message }));
    }
  }, data.time * 1000 * 60);
  clearTimer = () => clear(timer);
}

export function Timer(props: Props) {
  const lastState = store.lastState.get({ loop: false, time: 3 });
  const [refresh, setRefresh] = useState(0);
  const [time, setTime] = useState(lastState.time);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [start, setStart] = useState(0);
  const [state, setState] = useState<"ready" | "start" | "end">("ready");
  const [loop, setLoop] = useState(lastState.loop);
  const [log, setLog] = useState<string[]>([]);
  // const [remain, setRemain] = useState(time * 60 *1000)
  const remain =
    time * 60 * 1000 -
    (state === "ready"
      ? 0
      : state === "start"
      ? (Date.now() - start) % (time * 60 * 1000)
      : state === "end"
      ? time * 60 * 1000
      : 0);
  useEffect(() => {
    let t = setInterval(() => {
      setRefresh((s) => s + 1);
      if (remain <= 1000 && state !== "end" && !loop) {
        setState("end");
      }
    }, 100);
    return () => clearInterval(t);
  }, [remain, state, loop]);
  useEffect(() => {
    document.title = "计时器";
    self.addEventListener("message", (e) => {
      if (typeof e.data === "string" && e.data[0] === "{") {
        let data = JSON.parse(e.data);
        if (data.type === "log") {
          setLog((l) => l.concat(data.data));
        }
      }
    });
  }, []);

  return (
    <div>
      <div className={css.root}>
        <div className={css.remainCard}>
          {dayjs(remain - 8 * 3600 * 1000).format("HH:mm:ss")}
        </div>
        <div className={css.props}>
          <Button color="primary" onClick={(e) => setShowTimePicker(true)}>
            {time + "分钟"}
          </Button>
          <Picker
            visible={showTimePicker}
            value={[time + ""]}
            columns={[
              [
                { label: "1分钟", value: "1" },
                { label: "3分钟", value: "3" },
                { label: "4分钟", value: "4" },
                { label: "10分钟", value: "10" },
                { label: "15分钟", value: "15" },
                { label: "20分钟", value: "20" },
                { label: "30分钟", value: "30" },
                { label: "6秒", value: "0.1" },
              ],
            ]}
            onClose={() => setShowTimePicker(false)}
            onConfirm={(e) => {
              setTime(Number(e));
              setState("ready");
              setShowTimePicker(false);
            }}
          />
          <Checkbox checked={loop} onChange={(e) => setLoop(e)}>
            循环
          </Checkbox>
        </div>
        <div className={css.props}>
          <Button
            color="primary"
            onClick={(e) => {
              startTimer({
                loop,
                time,
              });
              setStart(Date.now());
              setState("start");
            }}
          >
            开始
          </Button>
          <Button
            color="warning"
            onClick={(e) => {
              clearTimer();
              setState("end");
            }}
          >
            结束
          </Button>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      {location.search.includes("debug") && (
        <div>
          {log.map((l) => (
            <div>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
