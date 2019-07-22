export default class WaveDispersionWrapper {
  constructor (bufferOutputMessageChannel, offscreenCanvas) {
    this.bufferOutputMessageChannel = bufferOutputMessageChannel
    this.offscreenCanvas = offscreenCanvas

    this.init = this.init.bind(this)
    this.handleMessage = this.handleMessage.bind(this)

    this.init()
  }

  init () {
    this.worker = new window.Worker('./scripts/WaveDispersionWorker/index.js')
    this.worker.addEventListener('message', msg => this.handleMessage(msg.data))

    this.worker.postMessage(
      {
        type: 'bufferOutputMessageChannels',
        data: {
          x: this.bufferOutputMessageChannel.x.port2,
          y: this.bufferOutputMessageChannel.y.port2
        }
      },
      [
        this.bufferOutputMessageChannel.x.port2,
        this.bufferOutputMessageChannel.y.port2
      ]
    )

    this.worker.postMessage(
      {
        type: 'offscreenCanvas',
        data: this.offscreenCanvas
      },
      [
        this.offscreenCanvas
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
    const messageHandlers = {}

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }
}
