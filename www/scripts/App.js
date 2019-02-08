import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import Simulation from './Simulation.js'

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
    this.update = this.update.bind(this)

    this.init()
  }

  init () {
    this.display = new Display(displaySize, displaySize)
    this.mirror = new Mirror(this.display.canvas, 3, 3)

    this.controls = new Controls()

    this.container.appendChild(this.mirror.canvas)
    this.container.appendChild(this.controls.container)

    this.simulation = new Simulation(
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

    this.update()
  }

  update () {
    if (this.simulation.gamma !== this.controls.gammaInput.value) {
      this.simulation.gamma = this.controls.gammaInput.value
      this.simulation.initPairCorrelation()
    }

    if (this.simulation.kappa !== this.controls.kappaInput.value) {
      this.simulation.kappa = this.controls.kappaInput.value
      this.simulation.initPairCorrelation()
    }

    this.controls.measuredGammaGraph.add(this.simulation.measuredGamma)

    const deltaR = physics.CutoffDistance / this.controls.pairCorrelationGraph.dataLength
    const area = k => (((k * deltaR) ** 2) * Math.PI) - ((((k - 1) * deltaR) ** 2) * Math.PI)
    this.controls.pairCorrelationGraph.data = (
      this.simulation.pairCorrelationData.map(
        (n, i) => (n / area(i)) / this.simulation.stepCount
      )
    )
    this.controls.pairCorrelationGraph.draw()

    this.simulation.update()
    this.display.draw(this.simulation.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    window.setTimeout(this.update, 20)
  }
}
