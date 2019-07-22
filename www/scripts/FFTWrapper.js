export default class FFTWrapper {
  constructor (fftPort2) {
    this.fftPort2 = fftPort2

    this.init = this.init.bind(this)
    this.handleMessage = this.handleMessage.bind(this)

    this.init()
  }

  init () {
    this.worker = new window.Worker('./scripts/FFTWorker/index.js')
    this.worker.addEventListener('message', msg => this.handleMessage(msg.data))

    this.worker.postMessage(
      {
        type: 'fftPort2',
        data: this.fftPort2
      },
      [
        this.fftPort2
      ]
    )

    this.data = []
  }

  initBuffer () {
    this.worker.postMessage({
      type: 'call',
      data: {
        name: 'initBuffer',
        arguments: []
      }
    })
  }

  reset () {
    this.worker.postMessage({
      type: 'call',
      data: {
        name: 'reset',
        arguments: []
      }
    })
  }

  handleMessage (msg) {
    const messageHandlers = {
      'data': data => {
        this.data = data
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }
}
