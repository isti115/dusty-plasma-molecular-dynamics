import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import Simulation from './Simulation.js'

import * as physics from './physics.js'

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
      this.controls.kappaInput.value
    )

    this.update()
  }

  update () {
    this.simulation.gamma = this.controls.gammaInput.value
    this.simulation.kappa = this.controls.kappaInput.value

    this.controls.kineticEnergyGraph.add(this.simulation.kineticEnergy)

    this.simulation.update()
    this.display.draw(this.simulation.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    window.setTimeout(this.update, 20)
  }
}
