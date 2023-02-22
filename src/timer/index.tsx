import React, { useEffect, useState } from 'react'
import Worker from './worker?worker'
const worker = new Worker()
Notification.requestPermission()
export interface Props {}

export function Timer(props: Props) {
  const [state, setState] = useState(0)
  useEffect(() => {
    worker.addEventListener('message', (e) => {
      setState((s) => {
        // if (s === 5 || s === 6) {
        //     const a = new Audio('/noti.mp3')
        //     a.play()
        //   navigator.vibrate([200, 100, 200])
        // }
        return s + e.data
      })
    })
  }, [])
  return <div>{state}</div>
}
