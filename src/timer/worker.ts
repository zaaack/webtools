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
      const noti = new Notification('倒计时提醒：'+ `${data.loop?'循环': ''}${data.time}分钟`, {
      })
      console.log('noti')
      self.postMessage(JSON.stringify({type: 'log', data:'noti'}))
    }, data.time * 1000 * 60)
    clearTimer = () => clear(timer)
  }
})
