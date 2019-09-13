// import * as utilities from './utilities.js'
// import * as physics from './physics.js'

export default class SimulationWrapper {
  constructor (
    {
      size,
      gridCount,
      particleCount,
      gamma,
      kappa,
      pairCorrelationResolution
    },
    bufferInputMessageChannel
  ) {
    this.size = size
    this.gridCount = gridCount
    this.particleCount = particleCount
    this._gamma = gamma
    this._kappa = kappa
    this.pairCorrelationResolution = pairCorrelationResolution
    this.bufferInputMessageChannel = bufferInputMessageChannel

    this.init = this.init.bind(this)
    this.initDataCollection = this.initDataCollection.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.update = this.update.bind(this)

    this.init()
  }

  get gamma () {
    return this._gamma
  }

  set gamma (value) {
    this._gamma = value
    this.worker.postMessage({
      type: 'gamma',
      data: this._gamma
    })
  }

  get kappa () {
    return this._kappa
  }

  set kappa (value) {
    this._kappa = value
    this.worker.postMessage({
      type: 'kappa',
      data: this._kappa
    })
  }

  init () {
    this.worker = new window.Worker('./scripts/SimulationWorker/index.js')
    this.worker.addEventListener('message', msg => this.handleMessage(msg.data))

    this.worker.postMessage(
      {
        type: 'bufferInputMessageChannel',
        data: {
          x: this.bufferInputMessageChannel.x.port1,
          y: this.bufferInputMessageChannel.y.port1
        }
      },
      [
        this.bufferInputMessageChannel.x.port1,
        this.bufferInputMessageChannel.y.port1
      ]
    )

    this.worker.postMessage({
      type: 'init',
      data: {
        size: this.size,
        gridCount: this.gridCount,
        particleCount: this.particleCount,
        gamma: this._gamma,
        kappa: this._kappa,
        pairCorrelationResolution: this.pairCorrelationResolution
      }
    })

    this.ready = false
    this.active = true
    this.update()
  }

  playPause () {
    this.active = !this.active

    if (this.active) {
      this.update()
    }
  }

  reset () {
    // this.worker.terminate()
    // this.init()

    this.worker.postMessage({
      type: 'init',
      data: {
        size: this.size,
        gridCount: this.gridCount,
        particleCount: this.particleCount,
        gamma: this._gamma,
        kappa: this._kappa,
        pairCorrelationResolution: this.pairCorrelationResolution
      }
    })
  }

  initDataCollection () {
    this.worker.postMessage({
      type: 'call',
      data: {
        name: 'initDataCollection',
        arguments: []
      }
    })
  }

  handleMessage (msg) {
    const messageHandlers = {
      'ready': data => {
        this.ready = true
      },

      'data': data => {
        this.data = data

        if (this.active) {
          this.update()
        }
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }

  update () {
    this.worker.postMessage({
      type: 'update',
      data: {}
    })
  }
}
