import Particle from './Particle.js'

export default class Simulation {
  constructor (width, height, count) {
    this.width = width
    this.height = height
    this.count = count

    this.init = this.init.bind(this)
    this.update = this.update.bind(this)

    this.init()
  }

  init () {
    this.particles = [...new Array(this.count)].map(_ => Particle.randomParticle())
  }

  update () {
    this.particles.forEach(p => {
      p.x = (this.width + p.x - 3 + (6 * Math.random())) % this.width
      p.y = (this.height + p.y - 3 + (6 * Math.random())) % this.height
    })
  }
}
