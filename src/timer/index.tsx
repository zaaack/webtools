import React, { useEffect, useState } from 'react'
import Worker from './worker?worker'
const worker = new Worker()
Notification.requestPermission()
export interface Props {}

export function Timer(props: Props) {
  const [refresh, setRefresh] = useState(0)
  const [time, setTime] = useState(1)
  const [start, setStart] = useState(0)
  const [state, setState] = useState<'ready' | 'start' | 'end'>('ready')
  const [loop, setLoop] = useState(false)
  // const [remain, setRemain] = useState(time * 60 *1000)
  const remain =
    time * 60 * 1000 -
    (state === 'ready'
      ? 0
      : state === 'start'
      ? (Date.now() - start) % (time*60*1000)
      : state === 'end'
      ? time * 60 * 1000
      : 0)
  useEffect(() => {
    document.title = '计时器'
    let t = setInterval(() => {
      setRefresh((s) => s + 1)
      if (remain <= 100 && state !== 'end' && !loop) {
        setState('end')
      }
    }, 100)
    return () => clearInterval(t)
  }, [remain, state, loop])

  return (
    <div>
      <div>
        <div>{new Date(remain - 8 * 3600 * 1000).toLocaleTimeString()}</div>
        <select
          value={time}
          onChange={(e) => {
            setTime(Number(e.target.value))
            setState('ready')
          }}
        >
          <option value="1">1:00</option>
          <option value="3">3:00</option>
          <option value="5">5:00</option>
          <option value="10">10:00</option>
          <option value="15">15:00</option>
          <option value="0.1">0:60</option>
        </select>
        <label
          htmlFor="
        "
        >
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop((e.target as any).checked)}
          />
          循环
        </label>
        <br />
        <button
          onClick={(e) => {
            worker.postMessage(
              JSON.stringify({
                type: 'start',
                loop,
                time,
              })
            )
            setStart(Date.now())
            setState('start')
          }}
        >
          开始
        </button>
      </div>
    </div>
  )
}
