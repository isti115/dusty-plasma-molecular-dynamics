import Particle from './Particle.js'
import * as physics from './physics.js'

import * as utilities from './utilities.js'

export default class Simulation {
  constructor (size, gridCount, particleCount) {
    this.size = size
    this.gridCount = gridCount
    this.particleCount = particleCount

    this.init = this.init.bind(this)
    this.placeParticles = this.placeParticles.bind(this)
    this.makeGrid = this.makeGrid.bind(this)
    this.processParticleWithCellFromIndex = this.processParticleWithCellFromIndex.bind(this)
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
        x: Math.floor(p.x / (this.size.x / this.gridCount.x)),
        y: Math.floor(p.y / (this.size.y / this.gridCount.y))
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
        x: currentParticle.x - (currentOtherParticle.x + (this.size.x * overflow.x)),
        y: currentParticle.y - (currentOtherParticle.y + (this.size.y * overflow.y))
      }

      const distance = utilities.norm(offset.x, offset.y)
      const cutoffDistance = 200
      if (distance < cutoffDistance) {
        const force = {
          x: (1 / offset.x) * (1 / distance),
          y: (1 / offset.y) * (1 / distance)
        }

        currentParticle.fx += force.x
        currentParticle.fy += force.y

        currentOtherParticle.fx -= force.x
        currentOtherParticle.fy -= force.y
      }
    }
  }

  calculateForces () {
    this.particles.forEach(p => {
      p.fx = 0
      p.fy = 0
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
      p => utilities.norm(p.vx, p.vy)
    ).reduce((a, b) => a + b, 0)

    // console.log(this.particles[15].vx, this.particles[15].vy)
    // console.log(speedSum)

    const dampening = speedSum > 100 ? 100 / speedSum : 1

    this.particles.forEach(p => {
      p.vx = dampening * p.vx + dt * p.fx
      p.vy = dampening * p.vy + dt * p.fy
    })
  }

  updatePosition (dt) {
    this.particles.forEach(p => {
      p.x = utilities.boundedValue(0, this.size.x, p.x + dt * p.vx)
      p.y = utilities.boundedValue(0, this.size.y, p.y + dt * p.vy)
    })
  }

  randomMove (dt) {
    this.particles.forEach(p => {
      p.x = utilities.boundedValue(0, this.size.x, p.x + dt * (-1 + (2 * Math.random())))
      p.y = utilities.boundedValue(0, this.size.y, p.y + dt * (-1 + (2 * Math.random())))
    })
  }

  update () {
    // this.randomMove()

    const dt = 1

    this.makeGrid()
    this.calculateForces()
    this.updateSpeed(dt)
    this.updatePosition(dt)
  }
}
