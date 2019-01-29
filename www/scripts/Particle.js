export default class Particle {
  constructor () {
    this.x = 0
    this.y = 0

    this.vx = 0
    this.vy = 0

    this.fx = 0
    this.fy = 0
  }

  static randomParticle () {
    const p = new Particle()

    p.x = Math.random() * 500
    p.y = Math.random() * 500

    // p.vx = 0
    // p.vy = 0

    // p.fx = 0
    // p.fy = 0

    return p
  }
}
