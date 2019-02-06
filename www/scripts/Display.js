import * as physics from './physics.js'

export default class Display {
  constructor (width, height) {
    this.width = width
    this.height = height

    this.init = this.init.bind(this)
    this.drawParticle = this.drawParticle.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.context = this.canvas.getContext('2d')
  }

  drawParticle (particle) {
    const particleSize = 2

    const { x, y } = particle.position
    const adjustedX = (x / physics.BoxSize) * this.width
    const adjustedY = (y / physics.BoxSize) * this.height
    this.context.beginPath()
    this.context.arc(adjustedX, adjustedY, particleSize, 0, 2 * Math.PI)
    this.context.fillStyle = '#000000'
    this.context.fill()
  }

  draw (particles) {
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = '#FFFFFF'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    particles.forEach(p => {
      this.drawParticle(p)
    })
  }
}
