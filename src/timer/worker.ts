export {}

let clearTimer: () => void
self.addEventListener('message', (e) => {
  let data = JSON.parse(e.data)
  console.log('data', data)
  if (data.type === 'start') {
    let set = data.loop ? setInterval : setTimeout
    let clear = data.loop ? clearInterval : clearTimeout
    clearTimer && clearTimer()
    let start = Date.now()
    let timer = set(() => {
      self.postMessage(JSON.stringify({ type: 'log', data: 'noti' }))
      console.log('noti')
      try {
        navigator.serviceWorker
          .getRegistration('./sw.js')
          .then((reg) => {
            reg?.showNotification(
              '倒计时提醒：' + `${data.loop ? '循环' : ''}${data.time}分钟`,
              {}
            )
          })
          .catch((err) => {
            self.postMessage(JSON.stringify({ type: 'log', data: err.message }))
          })
      } catch (error: any) {
        self.postMessage(JSON.stringify({ type: 'log', data: error.message }))
      }
      try {
        const noti = new Notification(
          '倒计时提醒：' + `${data.loop ? '循环' : ''}${data.time}分钟`,
          {}
        )
      } catch (error: any) {
        self.postMessage(JSON.stringify({ type: 'log', data: error.message }))
      }
    }, data.time * 1000 * 60)
    clearTimer = () => clear(timer)
  }
})
