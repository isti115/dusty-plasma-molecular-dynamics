import Particle from './Particle.js'

import * as utilities from './utilities.js'

export default class Simulation {
  constructor (size, gridCount, particleCount, desiredTemperature) {
    this.size = size
    this.gridCount = gridCount
    this.particleCount = particleCount
    this.desiredTemperature = desiredTemperature

    this.init = this.init.bind(this)
    this.placeParticles = this.placeParticles.bind(this)
    this.makeGrid = this.makeGrid.bind(this)
    this.processParticleWithCellFromIndex = (
      this.processParticleWithCellFromIndex.bind(this)
    )
    this.calculateForces = this.calculateForces.bind(this)
    this.updateSpeed = this.updateSpeed.bind(this)
    this.updatePosition = this.updatePosition.bind(this)
    this.randomMove = this.randomMove.bind(this)
    this.update = this.update.bind(this)

    this.init()
  }

  init () {
    this.placeParticles()
    this.makeGrid()
  }

  placeParticles () {
    this.particles = utilities.generateArray(
      this.particleCount,
      () => Particle.randomParticle(this.size)
    )
  }

  makeGrid () {
    this.grid = utilities.generateArray(
      this.gridCount.y,
      () => utilities.generateArray(this.gridCount.x, () => [])
    )

    this.particles.forEach(p => {
      const cell = {
        x: Math.floor(p.position.x / (this.size.x / this.gridCount.x)),
        y: Math.floor(p.position.y / (this.size.y / this.gridCount.y))
      }

      this.grid[cell.y][cell.x].push(p)
    })
  }

  processParticleWithCellFromIndex (currentParticle, cell, fromIndex) {
    const overflow = {
      x: cell.x < 0 ? -1 : cell.x > this.gridCount.x - 1 ? 1 : 0,
      y: cell.y < 0 ? -1 : cell.y > this.gridCount.y - 1 ? 1 : 0
    }

    const boundedCell = {
      x: cell.x - overflow.x * this.gridCount.x,
      y: cell.y - overflow.y * this.gridCount.y
    }

    const currentOtherCell = this.grid[boundedCell.y][boundedCell.x]

    for (
      let otherParticleIndex = fromIndex;
      otherParticleIndex < currentOtherCell.length;
      otherParticleIndex++
    ) {
      const currentOtherParticle = currentOtherCell[otherParticleIndex]

      const offset = {
        x: currentParticle.position.x - (
          currentOtherParticle.position.x + (this.size.x * overflow.x)
        ),
        y: currentParticle.position.y - (
          currentOtherParticle.position.y + (this.size.y * overflow.y)
        )
      }

      const distance = utilities.norm(offset.x, offset.y)
      const cutoffDistance = 200
      if (distance < cutoffDistance) {
        const force = {
          x: (1 / offset.x) * (1 / distance),
          y: (1 / offset.y) * (1 / distance)
        }

        currentParticle.force.x += force.x
        currentParticle.force.y += force.y

        currentOtherParticle.force.x -= force.x
        currentOtherParticle.force.y -= force.y
      }
    }
  }

  calculateForces () {
    this.particles.forEach(p => {
      p.previousForce = p.force
      p.force = { x: 0, y: 0 }
    })

    for (let x = 0; x < this.gridCount.x; x++) {
      for (let y = 0; y < this.gridCount.y; y++) {
        for (
          let particleIndex = 0;
          particleIndex < this.grid[y][x].length;
          particleIndex++
        ) {
          const currentParticle = this.grid[y][x][particleIndex]

          this.processParticleWithCellFromIndex(
            currentParticle, { x, y }, particleIndex + 1
          )

          /* eslint-disable */
          const neighbours = [
            { x: x - 1, y: y - 1 },
            { x,        y: y - 1 },
            { x: x - 1, y        },
            { x: x - 1, y: y + 1 }
          ]
          /* eslint-enable */

          neighbours.forEach(n => {
            this.processParticleWithCellFromIndex(currentParticle, n, 0)
          })
        }
      }
    }
  }

  updateSpeed (dt) {
    const speedSum = this.particles.map(
      p => utilities.norm(p.velocity.x, p.velocity.y)
    ).reduce((a, b) => a + b, 0)

    // console.log(this.particles[15].vx, this.particles[15].vy)
    // console.log(speedSum)

    const dampening = (
      speedSum > this.desiredTemperature
        ? this.desiredTemperature / speedSum
        : 1
    )

    this.particles.forEach(p => {
      p.velocity.x = dampening * p.velocity.x + dt * p.force.x
      p.velocity.y = dampening * p.velocity.y + dt * p.force.y
    })
  }

  updatePosition (dt) {
    this.particles.forEach(p => {
      p.position.x = utilities.boundedValue(
        0,
        this.size.x,
        p.position.x + dt * p.velocity.x
      )
      p.position.y = utilities.boundedValue(
        0,
        this.size.y,
        p.position.y + dt * p.velocity.y
      )
    })
  }

  randomMove (dt) {
    this.particles.forEach(p => {
      p.position.x = utilities.boundedValue(
        0,
        this.size.x,
        p.position.x + dt * (-1 + (2 * Math.random()))
      )
      p.position.y = utilities.boundedValue(
        0,
        this.size.y,
        p.position.y + dt * (-1 + (2 * Math.random()))
      )
    })
  }

  update () {
    // this.randomMove()
    while (this.particles.length > this.particleCount) {
      this.particles.pop()
    }
    while (this.particles.length < this.particleCount) {
      this.particles.push(Particle.randomParticle(this.size))
    }

    const dt = 1

    this.makeGrid()
    this.calculateForces()
    this.updateSpeed(dt)
    this.updatePosition(dt)
  }
}
