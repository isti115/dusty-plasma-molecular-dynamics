import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import SimulationWrapper from './SimulationWrapper.js'

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

    this.simulationWrapper = new SimulationWrapper(
      { x: physics.BoxSize, y: physics.BoxSize },
      { x: 3, y: 3 },
      physics.ParticleCount,
      this.controls.gammaInput.value,
      this.controls.kappaInput.value,
      this.controls.pairCorrelationGraph.dataLength
    )

    this.controls.pairCorrelationGraph.data = utilities.generateArray(
      this.controls.pairCorrelationGraph.dataLength, () => 0
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
    }

    if (this.simulationWrapper.kappa !== this.controls.kappaInput.value) {
      this.simulationWrapper.kappa = this.controls.kappaInput.value
      this.simulationWrapper.initPairCorrelation()
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

    // this.simulationWrapper.update()
    this.display.draw(this.simulationWrapper.data.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    // window.setTimeout(this.update, 20)
    window.requestAnimationFrame(this.update)
  }
}
