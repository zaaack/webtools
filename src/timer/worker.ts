export {}
setInterval(() => {
    self.postMessage(1)
}, 1000)

setTimeout(() => {

    const noti = new Notification('haha')
}, 5000)
