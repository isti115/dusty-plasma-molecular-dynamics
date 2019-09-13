export default class FFTWrapper {
  constructor (bufferInputMessageChannel, bufferOutputMessageChannel) {
    this.bufferInputMessageChannel = bufferInputMessageChannel
    this.bufferOutputMessageChannel = bufferOutputMessageChannel

    this.init = this.init.bind(this)
    this.handleMessage = this.handleMessage.bind(this)

    this.init()
  }

  init () {
    this.worker = {
      x: new window.Worker('./scripts/BufferWorker/index.js'),
      y: new window.Worker('./scripts/BufferWorker/index.js')
    }

    this.worker.x.addEventListener('message', msg => this.handleMessage(msg.data))
    this.worker.y.addEventListener('message', msg => this.handleMessage(msg.data))

    this.worker.x.postMessage(
      {
        type: 'bufferMessageChannels',
        data: {
          input: this.bufferInputMessageChannel.x.port2,
          output: this.bufferOutputMessageChannel.x.port1
        }
      },
      [
        this.bufferInputMessageChannel.x.port2,
        this.bufferOutputMessageChannel.x.port1
      ]
    )

    this.worker.y.postMessage(
      {
        type: 'bufferMessageChannels',
        data: {
          input: this.bufferInputMessageChannel.y.port2,
          output: this.bufferOutputMessageChannel.y.port1
        }
      },
      [
        this.bufferInputMessageChannel.y.port2,
        this.bufferOutputMessageChannel.y.port1
      ]
    )
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
