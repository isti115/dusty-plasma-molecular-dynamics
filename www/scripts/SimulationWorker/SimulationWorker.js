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
    // this.active = false
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

      const xPositions = new ArrayBuffer(this.simulation.particleCount * 8)
      const xVelocities = new ArrayBuffer(this.simulation.particleCount * 8)
      const yPositions = new ArrayBuffer(this.simulation.particleCount * 8)
      const yVelocities = new ArrayBuffer(this.simulation.particleCount * 8)

      const xPositionsView = new Float64Array(xPositions)
      const xVelocitiesView = new Float64Array(xVelocities)
      const yPositionsView = new Float64Array(yPositions)
      const yVelocitiesView = new Float64Array(yVelocities)

      this.simulation.particles.forEach((p, i) => {
        xPositionsView[i] = p.position.x
        xVelocitiesView[i] = p.velocity.x
        yPositionsView[i] = p.position.y
        yVelocitiesView[i] = p.velocity.y
      })

      const msg = {
        type: 'coordinates',
        data: {
          y: {
            positions: yPositions,
            velocities: yVelocities
          },
          x: {
            positions: xPositions,
            velocities: xVelocities
          }
        }
      }

      this.fftPort1.postMessage(
        msg,
        [
          msg.data.x.positions,
          msg.data.x.velocities,
          msg.data.y.positions,
          msg.data.y.velocities
        ]
      )

      // this.fftPort1.postMessage({
      //   type: 'coordinates',
      //   data: {}
      // })

      // const coordinates = {
      //   y: (
      //     this.simulation.particles.map(
      //       p => ({
      //         pos: p.position.y,
      //         vel: p.velocity.y
      //       })
      //     )
      //   ),
      //   x: (
      //     this.simulation.particles.map(
      //       p => ({
      //         pos: p.position.x,
      //         vel: p.velocity.x
      //       })
      //     )
      //   )
      // }

      // this.fftPort1.postMessage({
      //   type: 'coordinates',
      //   data: coordinates
      // })

      // console.log(JSON.stringify(coordinates).length)
    }

    this.sendData()
  }
}

// Worker export:

this.SimulationWorker = SimulationWorker
