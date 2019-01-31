export default class Particle {
  constructor () {
    this.position = { x: 0, y: 0 }
    this.velocity = { x: 0, y: 0 }
    this.force = { x: 0, y: 0 }
    this.previousForce = { x: 0, y: 0 }
  }

  static randomParticle (limit) {
    const p = new Particle()

    p.position = {
      x: Math.random() * limit.x,
      y: Math.random() * limit.y
    }

    return p
  }
}
