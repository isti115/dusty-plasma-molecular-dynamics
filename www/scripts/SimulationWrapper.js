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
    fftPort1
  ) {
    this.size = size
    this.gridCount = gridCount
    this.particleCount = particleCount
    this._gamma = gamma
    this._kappa = kappa
    this.pairCorrelationResolution = pairCorrelationResolution
    this.fftPort1 = fftPort1

    this.init = this.init.bind(this)
    this.initPairCorrelation = this.initPairCorrelation.bind(this)
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
        type: 'fftPort1',
        data: this.fftPort1
      },
      [
        this.fftPort1
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

  initPairCorrelation () {
    this.worker.postMessage({
      type: 'call',
      data: {
        name: 'initPairCorrelation',
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
