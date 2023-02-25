import { useEffect, useRef, useState } from 'react'
import css from './App.module.scss'
import tinycolor from 'tinycolor2'
import izitoast from 'izitoast'
export interface Record {
  time: Date
  color: string
  hsl: string
}
function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>()
  const [data, setData] = useState<Record[]>([])

  useEffect(() => {
    document.title ='颜色强度计'
    var canvas = canvasRef.current!
    ctxRef.current = canvas.getContext('2d')
    var video = videoRef.current!

    // Put video listeners into place
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        console.log(devices.filter(d => d.kind == 'videoinput'))
        navigator.mediaDevices.getUserMedia({
          video: {
            width: 320,
            height: 320,
            deviceId: devices.filter(d => d.kind == 'videoinput').slice(-1)[0].deviceId,
          },
        }).then(function (stream) {
          stream.addEventListener('addtrack', console.log)
          stream.addEventListener('removetrack', console.log)
          video.srcObject = stream
          video.play().catch(console.error)
          let w = window as any
          w['video'] = video
          w['stream'] = stream
        }).catch(console.error)
      })

    }
  }, [])
  return (
    <div className={css.root}>
      <div className={css.capture}>
        <video ref={videoRef} width="320" height="320" autoPlay></video>
        <div className={css.cross}>
        </div>
      </div>

      <button
        className={css.snapBtn}
        onClick={(e) => {
          let ctx = ctxRef.current!
          ctx.clearRect(0, 0, 320, 320)
          ctx.drawImage(videoRef.current!, 0, 0, 320, 320)
          let d = ctx.getImageData(320/2, 320/2, 1, 1)
          let c = tinycolor({
            r: d.data[0],
            g: d.data[1],
            b: d.data[2],
            a: d.data[3],
          })
          setData([{
            time: new Date,
            color: c.toRgbString(),
            hsl: c.toHslString()
          }, ...data])
          console.log(d,c)
        }}
      >
        拍照
      </button>
      <div className={css.records}>
        {data.map((d, i) => {
          return (
            <div className={css.item} key={i}>
              <span>{d.time.toLocaleString()}</span>
              <i style={{ backgroundColor: d.color }}></i>
              <span>{d.hsl}</span>
              <button className={css.copyBtn} onClick={e => {
                navigator.clipboard.writeText(`${d.time.toLocaleString()} ${d.color} ${d.hsl}`).then(() => {
                  izitoast.success({
                    title: '复制成功'
                  })
                }).catch(err => {
                  console.error(err)
                  izitoast.error({
                    title: '复制失败:'+err.message
                  })
                })
              }}>复制</button>
            </div>
          )
        })}
      </div>
      <canvas ref={canvasRef} style={{position: 'absolute', left: '-100%', }} width="320" height="320"></canvas>
    </div>
  )
}

export default App
