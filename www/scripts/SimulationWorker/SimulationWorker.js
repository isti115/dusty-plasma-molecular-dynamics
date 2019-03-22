/* global physics Simulation */

class SimulationWorker {
  constructor (postMessage) {
    // Storing parameters
    this.sendMessage = postMessage

    // Binding methods
    this.init = this.init.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.sendData = this.sendData.bind(this)
    this.update = this.update.bind(this)

    // Init
    this.init()
  }

  init () {
    this.active = false
  }

  handleMessage (msg) {
    const messageHandlers = {
      'fftPort1': data => {
        this.fftPort1 = data
      },

      'gamma': data => {
        this.simulation.gamma = data
      },

      'kappa': data => {
        this.simulation.kappa = data
      },

      'init': data => {
        this.simulation = this.simulation = new Simulation(
          data.size,
          data.gridCount,
          data.particleCount,
          data.gamma,
          data.kappa,
          data.pairCorrelationResolution
        )

        this.sendData()

        this.sendMessage({
          type: 'ready',
          data: {}
        })
      },

      'call': data => {
        this.simulation[data.name](...data.arguments)
      },

      'update': data => {
        this.update()
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }

  sendData () {
    this.sendMessage({
      type: 'data',
      data: {
        stepCount: this.simulation.stepCount,
        pairCorrelationData: this.simulation.pairCorrelationData,
        measuredGamma: this.simulation.measuredGamma,
        particles: this.simulation.particles
      }
    })
  }

  update () {
    this.simulation.lambdaD = physics.WignerSeitzRadius / this.simulation.kappa

    const updateMultiplier = 5

    for (let updateIndex = 0; updateIndex < updateMultiplier; updateIndex++) {
      this.simulation.update()

      const xCoordinates = this.simulation.particles.map(
        p => ({
          x: p.position.x,
          vx: p.velocity.x
        })
      )
      this.fftPort1.postMessage({
        type: 'xCoordinates',
        data: xCoordinates
      })
    }

    this.sendData()
  }
}

// Worker export:

this.SimulationWorker = SimulationWorker
