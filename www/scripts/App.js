import Display from './Display.js'
import Simulation from './Simulation.js'
import Mirror from './Mirror.js'

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
    this.container.appendChild(this.mirror.canvas)

    this.simulation = new Simulation(displaySize, displaySize, 50)

    this.update()
  }

  update () {
    this.simulation.update()
    this.display.draw(this.simulation.particles)
    this.mirror.draw()

    window.setTimeout(this.update, 20)
  }
}
