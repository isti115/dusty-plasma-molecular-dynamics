/* global utilities physics Complex */

class BufferWorker {
  constructor (postMessage) {
    // Storing parameters
    this.sendMessage = postMessage

    // Binding methods
    this.init = this.init.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.processCoordinates = this.processCoordinates.bind(this)

    // Init
    this.init()
  }

  init () {
    this.kCount = 1 + Math.floor(
      (3 * physics.BoxSize) / (2 * Math.PI * physics.WignerSeitzRadius)
    ) * 2
    this.deltaOmega = (2 * Math.PI) / (this.bufferLength * physics.dt)
    this.omegaCount = Math.round(1.5 * physics.PlasmaFrequency / this.deltaOmega)
    // console.log('omegaCount', this.omegaCount)
    // console.log('kCount', this.kCount)
  }

  processCoordinates (data) {
    return utilities.generateArray(
      this.kCount,
      m => utilities.generateArray(
        data.positions.length,
        i => (Complex.mul(
          new Complex(data.velocities[i], 0),
          Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * data.positions[i]))
        ))
      ).reduce((a, b) => Complex.add(a, b), new Complex(0, 0))
    )
  }

  // processCoordinates (data) {
  //   return utilities.generateArray(
  //     this.kCount,
  //     m => data.map(
  //       p => (Complex.mul(
  //         new Complex(p.vel, 0),
  //         Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * p.pos))
  //       ))
  //     ).reduce((a, b) => Complex.add(a, b), new Complex(0, 0))
  //   )
  // }

  handleMessage (msg) {
    const messageHandlers = {
      'bufferMessageChannels': data => {
        this.bufferInputMessageChannel = data.input
        this.bufferOutputMessageChannel = data.output

        this.bufferInputMessageChannel.addEventListener(
          'message',
          msg => this.handleMessage(msg.data)
        )
        this.bufferInputMessageChannel.start()
      },

      'call': data => {
        this[data.name](...data.arguments)
      },

      'coordinates': data => {
        const preparedData = {
          positions: new Float64Array(data.positions),
          velocities: new Float64Array(data.velocities)
        }

        this.bufferOutputMessageChannel.postMessage({
          type: 'processedCoordinates',
          data: this.processCoordinates(preparedData)
        })

        // this.bufferOutputMessageChannel.postMessage({
        //   type: 'processedCoordinates',
        //   data: this.processCoordinates(data)
        // })
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }
}

// Worker export:

this.BufferWorker = BufferWorker
