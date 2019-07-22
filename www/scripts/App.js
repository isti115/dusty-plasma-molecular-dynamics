import Controls from './Controls.js'
import Display from './Display.js'
import Mirror from './Mirror.js'
import SimulationWrapper from './SimulationWrapper.js'
import FFTWrapper from './FFTWrapper.js'

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
      this.fftWrapper.reset()
    })

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

    this.controls.measuredGammaGraph.target = this.controls.gammaInput.value

    this.controls.pairCorrelationGraph.bottomScale.form = 0
    this.controls.pairCorrelationGraph.bottomScale.to = (
      physics.CutoffDistance / physics.WignerSeitzRadius
    )
    // this.controls.pairCorrelationGraph.bottomScale.to = 5.75
    this.controls.pairCorrelationGraph.bottomScale.markers = utilities.generateArray(11)

    this.container.appendChild(this.controls.container)

    this.display = new Display(displaySize, displaySize)
    this.mirror = new Mirror(this.display.canvas, 3, 3)
    this.container.appendChild(this.mirror.canvas)

    this.fftMessageChannel = new window.MessageChannel()

    this.simulationWrapper = new SimulationWrapper(
      {
        size: { x: physics.BoxSize, y: physics.BoxSize },
        gridCount: { x: physics.GridSize, y: physics.GridSize },
        particleCount: physics.ParticleCount,
        gamma: this.controls.gammaInput.value,
        kappa: this.controls.kappaInput.value,
        pairCorrelationResolution: this.controls.pairCorrelationGraph.dataLength
      },
      this.fftMessageChannel.port1
    )

    this.fftWrapper = new FFTWrapper(
      this.fftMessageChannel.port2
    )

    this.controls.pairCorrelationGraph.data = utilities.generateArray(
      this.controls.pairCorrelationGraph.dataLength, () => 0
    )

    const offscreen = this.controls.waveDispersionHeatmap.canvas.transferControlToOffscreen()

    this.fftWrapper.worker.postMessage(
      {
        type: 'canvas',
        data: offscreen
      },
      [
        offscreen
      ]
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
      this.fftWrapper.reset()
    }

    if (this.simulationWrapper.kappa !== this.controls.kappaInput.value) {
      this.simulationWrapper.kappa = this.controls.kappaInput.value
      this.simulationWrapper.initDataCollection()
      this.fftWrapper.reset()
    }

    if (this.simulationWrapper.active) {
      this.controls.measuredGammaGraph.add(this.simulationWrapper.data.measuredGamma)

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

    this.display.draw(this.simulationWrapper.data.particles)
    this.mirror.draw(this.controls.mirrorToggle.value)

    // window.setTimeout(this.update, 20)
    window.requestAnimationFrame(this.update)
  }
}
