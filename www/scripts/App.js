import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import SimulationWrapper from './SimulationWrapper.js'
import BufferWrapper from './BufferWrapper.js'
import WaveDispersionWrapper from './WaveDispersionWrapper.js'

import physics from './physics.js'
import utilities from './utilities.js'

const displaySize = 300

export default class App {
  /**
   * @param {HTMLElement} container
   */
  constructor (container) {
    this.container = container

    this.init = this.init.bind(this)
    this.waitForSimulation = this.waitForSimulation.bind(this)
    this.update = this.update.bind(this)

    this.init()
  }

  init () {
    this.controls = new Controls()

    // #region Play/Pause and Reset buttons

    this.controls.playPauseButton.container.addEventListener('click', () => {
      this.simulationWrapper.playPause()

      ;[
        this.controls.playPauseButton.text.nodeValue,
        this.controls.playPauseButton.image.src
      ] = this.simulationWrapper.active
        ? ['Pause', './images/pause.png']
        : ['Continue', './images/play.png']
    })

    this.controls.resetButton.container.addEventListener('click', () => {
      this.simulationWrapper.reset()

      this.controls.measuredGammaGraph.data = []
      this.recordGamma = false
      setTimeout(() => { this.recordGamma = true }, 333)
      this.controls.measuredGammaGraph.draw()

      this.waveDispersionWrapper.reset()
    })

    // #endregion

    // #region Periodic Display toggle

    // For the Electron packaged version:
    try {
      const electron = require('electron')
      const { ipcRenderer } = electron

      this.controls.mirrorToggle.input.addEventListener('change', () => {
        ipcRenderer.send('mirrorToggle', this.controls.mirrorToggle.value)
      })

      console.info('Running in electron mode.')
    } catch (e) {
      console.info('Running in browser mode.')
    }

    // #endregion

    // #region Measured Gamma and Pair Correlation graphs

    this.controls.measuredGammaGraph.target = this.controls.gammaInput.value
    this.recordGamma = true

    this.controls.pairCorrelationGraph.bottomScale.form = 0
    this.controls.pairCorrelationGraph.bottomScale.to = (
      physics.CutoffDistance / physics.WignerSeitzRadius
    )
    // this.controls.pairCorrelationGraph.bottomScale.to = 5.75
    this.controls.pairCorrelationGraph.bottomScale.markers = utilities.generateArray(11)

    this.controls.pairCorrelationGraph.data = utilities.generateArray(
      this.controls.pairCorrelationGraph.dataLength, () => 0
    )

    // #endregion

    this.container.appendChild(this.controls.container)

    this.display = new Display(displaySize, displaySize)
    this.mirror = new Mirror(this.display.canvas, 3, 3)
    this.container.appendChild(this.mirror.canvas)

    this.bufferInputMessageChannel = {
      x: new window.MessageChannel(),
      y: new window.MessageChannel()
    }

    this.simulationWrapper = new SimulationWrapper(
      {
        size: { x: physics.BoxSize, y: physics.BoxSize },
        gridCount: { x: physics.GridSize, y: physics.GridSize },
        particleCount: physics.ParticleCount,
        gamma: this.controls.gammaInput.value,
        kappa: this.controls.kappaInput.value,
        pairCorrelationResolution: this.controls.pairCorrelationGraph.dataLength
      },
      this.bufferInputMessageChannel
    )

    this.bufferOutputMessageChannel = {
      x: new window.MessageChannel(),
      y: new window.MessageChannel()
    }

    this.bufferWrapper = new BufferWrapper(
      this.bufferInputMessageChannel,
      this.bufferOutputMessageChannel
    )

    const offscreenCanvas = (
      this.controls.waveDispersionHeatmap.canvas.transferControlToOffscreen()
    )
    this.waveDispersionWrapper = new WaveDispersionWrapper(
      this.bufferOutputMessageChannel,
      offscreenCanvas
    )

    this.waitForSimulation()
  }

  waitForSimulation () {
    if (!this.simulationWrapper.ready) {
      window.setTimeout(this.waitForSimulation, 100)
    } else {
      this.update()
    }
  }

  update () {
    if (!this.simulationWrapper.active) {
      window.requestAnimationFrame(this.update)
      return
    }

    if (this.simulationWrapper.gamma !== this.controls.gammaInput.value) {
      this.controls.measuredGammaGraph.target = this.controls.gammaInput.value
      this.simulationWrapper.gamma = this.controls.gammaInput.value
      this.simulationWrapper.initDataCollection()
      this.waveDispersionWrapper.reset()
    }

    if (this.simulationWrapper.kappa !== this.controls.kappaInput.value) {
      this.simulationWrapper.kappa = this.controls.kappaInput.value
      this.simulationWrapper.initDataCollection()
      this.waveDispersionWrapper.reset()
    }

    if (this.simulationWrapper.active) {
      if (this.recordGamma) {
        this.controls.measuredGammaGraph.add(this.simulationWrapper.data.measuredGamma)
      }

      const gammaDifference = Math.abs(
        this.controls.gammaInput.value - this.simulationWrapper.data.measuredGamma
      )

      this.controls.measuredGammaGraph.leftScale.markers = [
        0,
        // this.controls.gammaInput.value,
        this.controls.measuredGammaGraph.target,
        1.2 * this.controls.measuredGammaGraph.target,
        ...(
          (gammaDifference / this.controls.gammaInput.value > 0.06)
            ? [this.simulationWrapper.data.measuredGamma]
            : []
        )
      ]

      this.controls.measuredGammaGraph.markers = [
        this.simulationWrapper.data.measuredGamma
      ]

      const timeStepSize = physics.dt * physics.PlasmaFrequency

      if (
        this.controls.measuredGammaGraph.data.length <
        this.controls.measuredGammaGraph.dataLength
      ) {
        this.controls.measuredGammaGraph.bottomScale.to = (
          this.controls.measuredGammaGraph.dataLength * timeStepSize
        )
      } else {
        this.controls.measuredGammaGraph.bottomScale.to += timeStepSize
      }

      this.controls.measuredGammaGraph.bottomScale.from = (
        this.controls.measuredGammaGraph.bottomScale.to -
        this.controls.measuredGammaGraph.dataLength * timeStepSize
      )

      this.controls.measuredGammaGraph.bottomScale.markers = (
        [...new Array(4)].map((_, i) => (
          (Math.round(this.controls.measuredGammaGraph.bottomScale.from / 3) * 3) + 3 * i
        ))
      )
    }

    if (this.simulationWrapper.data.stepCount > physics.strongThermostateStepCount) {
      const deltaR = physics.CutoffDistance / this.controls.pairCorrelationGraph.dataLength
      const area = k => (((k * deltaR) ** 2) * Math.PI) - ((((k - 1) * deltaR) ** 2) * Math.PI)
      this.controls.pairCorrelationGraph.data = (
        this.simulationWrapper.data.pairCorrelationData.map(
          (n, i) => (n / area(i + 1)) /
        (this.simulationWrapper.data.stepCount - physics.strongThermostateStepCount)
        )
      )

      this.controls.pairCorrelationGraph.data = (
        this.controls.pairCorrelationGraph.data.map(
          d => d / 1250000000
        )
      )

      this.controls.pairCorrelationGraph.target = (
        Math.max(...this.controls.pairCorrelationGraph.data)
      )

      this.controls.pairCorrelationGraph.leftScale.markers = [
        0,
        1,
        this.controls.pairCorrelationGraph.target,
        1.2 * this.controls.pairCorrelationGraph.target
      ]
      this.controls.pairCorrelationGraph.draw()
    } else {
      this.controls.pairCorrelationGraph.clear()
      this.controls.pairCorrelationGraph.context.font = '18px Century Gothic'
      this.controls.pairCorrelationGraph.context.fillStyle = '#000000'
      this.controls.pairCorrelationGraph.context.fillText('Strong thermalisation in progress,', 8, 100)
      this.controls.pairCorrelationGraph.context.fillText('no data is being collected.', 32, 120)
    }

    this.display.draw(this.simulationWrapper.data.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    // window.setTimeout(this.update, 20)
    window.requestAnimationFrame(this.update)
  }
}
