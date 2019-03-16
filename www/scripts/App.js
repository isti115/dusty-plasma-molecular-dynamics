import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import SimulationWrapper from './SimulationWrapper.js'
import FFTWrapper from './FFTWrapper.js'

import * as physics from './physics.js'
import * as utilities from './utilities.js'

const displaySize = 300

export default class App {
  /**
   * @param {HTMLElement} container
   */
  constructor (container) {
    this.container = container

    this.init = this.init.bind(this)
    this.waitForSimulation = this.waitForSimulation.bind(this)
    this.update = this.update.bind(this)

    this.init()
  }

  init () {
    this.display = new Display(displaySize, displaySize)
    this.mirror = new Mirror(this.display.canvas, 3, 3)

    this.controls = new Controls()

    this.container.appendChild(this.mirror.canvas)
    this.container.appendChild(this.controls.container)

    this.fftMessageChannel = new window.MessageChannel()

    this.simulationWrapper = new SimulationWrapper(
      {
        size: { x: physics.BoxSize, y: physics.BoxSize },
        gridCount: { x: 3, y: 3 },
        particleCount: physics.ParticleCount,
        gamma: this.controls.gammaInput.value,
        kappa: this.controls.kappaInput.value,
        pairCorrelationResolution: this.controls.pairCorrelationGraph.dataLength
      },
      this.fftMessageChannel.port1
    )

    this.fftWrapper = new FFTWrapper(
      this.fftMessageChannel.port2
    )

    this.controls.pairCorrelationGraph.data = utilities.generateArray(
      this.controls.pairCorrelationGraph.dataLength, () => 0
    )

    const offscreen = this.controls.waveDispersionHeatmap.canvas.transferControlToOffscreen()

    this.fftWrapper.worker.postMessage(
      {
        type: 'canvas',
        data: offscreen
      },
      [
        offscreen
      ]
    )

    this.waitForSimulation()
  }

  waitForSimulation () {
    if (!this.simulationWrapper.ready) {
      window.setTimeout(this.waitForSimulation, 100)
    } else {
      this.update()
    }
  }

  update () {
    if (this.simulationWrapper.gamma !== this.controls.gammaInput.value) {
      this.simulationWrapper.gamma = this.controls.gammaInput.value
      this.simulationWrapper.initPairCorrelation()
      this.fftWrapper.initBuffer()
    }

    if (this.simulationWrapper.kappa !== this.controls.kappaInput.value) {
      this.simulationWrapper.kappa = this.controls.kappaInput.value
      this.simulationWrapper.initPairCorrelation()
      this.fftWrapper.initBuffer()
    }

    this.controls.measuredGammaGraph.add(this.simulationWrapper.data.measuredGamma)

    const deltaR = physics.CutoffDistance / this.controls.pairCorrelationGraph.dataLength
    const area = k => (((k * deltaR) ** 2) * Math.PI) - ((((k - 1) * deltaR) ** 2) * Math.PI)
    this.controls.pairCorrelationGraph.data = (
      this.simulationWrapper.data.pairCorrelationData.map(
        (n, i) => (n / area(i)) / this.simulationWrapper.data.stepCount
      )
    )
    this.controls.pairCorrelationGraph.draw()

    if (this.fftWrapper.draw) {
      this.controls.waveDispersionHeatmap.draw(this.fftWrapper.offscreenCanvas)
      this.fftWrapper.draw = false
    }

    // this.simulationWrapper.update()
    this.display.draw(this.simulationWrapper.data.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    // window.setTimeout(this.update, 20)
    window.requestAnimationFrame(this.update)
  }
}
