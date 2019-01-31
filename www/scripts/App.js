import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import Simulation from './Simulation.js'

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
      { x: displaySize, y: displaySize },
      { x: 5, y: 5 },
      50
    )

    this.update()
  }

  update () {
    this.simulation.particleCount = this.controls.countInput.value
    this.simulation.desiredTemperature = this.controls.temperatureInput.value

    this.controls.kineticEnergyGraph.add(this.simulation.kineticEnergy)

    this.simulation.update()
    this.display.draw(this.simulation.particles)
    this.mirror.draw()

    window.setTimeout(this.update, 20)
  }
}
