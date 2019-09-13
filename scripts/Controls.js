import physics from './physics.js'
import utilities from './utilities.js'

const makeTitle = title => {
  const text = window.document.createElement('p')
  text.classList.add('title')

  text.appendChild(window.document.createTextNode(title))
  // text.innerHTML = title

  return text
}

class Button {
  constructor (name, imageSrc) {
    this.name = name
    this.imageSrc = imageSrc

    this.init = this.init.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('button')

    this.image = window.document.createElement('img')
    this.image.src = this.imageSrc
    this.container.appendChild(this.image)

    this.text = document.createTextNode(this.name)
    this.container.appendChild(this.text)

    this.container.value = this.name
  }
}

class Toggle {
  constructor (name, defaultValue) {
    this.name = name
    this.defaultValue = defaultValue

    this.init = this.init.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('toggle')

    this.label = window.document.createElement('label')
    this.container.appendChild(this.label)

    this.input = window.document.createElement('input')
    this.input.type = 'checkbox'
    this.input.checked = this.defaultValue
    this.label.appendChild(this.input)

    this.checkmark = window.document.createElement('span')
    this.checkmark.classList.add('checkmark')
    this.label.appendChild(this.checkmark)

    this.text = window.document.createTextNode(this.name)
    this.label.appendChild(this.text)
  }

  get value () {
    return this.input.checked
  }

  set value (value) {
    this.input.checked = value
  }
}

class Slider {
  constructor (name, min, max, defaultValue, stepSize, modifierFunction = (x => x)) {
    this.name = name
    this.min = min
    this.max = max
    this.defaultValue = defaultValue
    this.stepSize = stepSize
    this.modifierFunction = modifierFunction

    this.init = this.init.bind(this)
    this.updateText = this.updateText.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('slider')

    this.text = window.document.createElement('p')
    this.container.appendChild(this.text)

    this.input = window.document.createElement('input')
    this.input.type = 'range'
    this.input.min = this.min
    this.input.max = this.max
    this.input.value = this.defaultValue
    this.input.step = this.stepSize
    this.input.addEventListener('input', this.updateText)
    this.container.appendChild(this.input)

    this.updateText()
  }

  updateText () {
    this.text.innerHTML = `${this.name}: ${this.value}`
  }

  get value () {
    const innerValue = window.Number(this.input.value)

    return this.modifierFunction(innerValue)
  }

  set value (value) {
    this.input.value = value
  }
}

class Graph {
  constructor (name, scales, width, height, dataLength, useLine, markers = []) {
    this.name = name
    this.scales = scales
    this.width = width
    this.height = height
    this.dataLength = dataLength
    this.useLine = useLine
    this.markers = markers

    this.init = this.init.bind(this)
    this.add = this.add.bind(this)
    this.clear = this.clear.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('graph')

    this.text = makeTitle(`${this.name}:`)
    this.container.appendChild(this.text)

    this.canvas = window.document.createElement('canvas')
    this.canvas.classList.add('graphCanvas')
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.context = this.canvas.getContext('2d')

    this.leftScale = new Scale(this.scales.yName, this.scales.yUnit, this.height, true)
    this.bottomScale = new Scale(this.scales.xName, this.scales.xUnit, this.width, false)

    this.container.appendChild(this.leftScale.container)
    this.container.appendChild(this.canvas)
    this.container.appendChild(window.document.createElement('br'))
    this.container.appendChild(this.bottomScale.container)

    this.data = []
    this.target = undefined
  }

  add (data) {
    this.data.push(data)

    while (this.data.length > this.dataLength) {
      this.data.shift()
    }

    this.draw()
  }

  clear () {
    this.context.fillStyle = '#FFFFFF'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw () {
    this.clear()

    const [minData, maxData] = this.target === undefined
      ? [Math.min(...this.data), Math.max(...this.data)]
      : [0, (this.target * 1.2)]

    const scale = this.height / (maxData - minData)

    if (this.useLine) {
      this.context.beginPath()
      // this.context.strokeStyle = '#000000'

      // this.context.moveTo(0, (this.height - scale * (this.data[0] - minData)))

      this.data.forEach((d, i) => {
        this.context.lineTo(i, (this.height - scale * (d - minData)))
      })

      this.context.stroke()
    } else {
      this.context.fillStyle = '#000000'
      this.data.forEach((d, i) => {
        this.context.fillRect(i, (this.height - scale * (d - minData)), 2, 2)
      })
    }

    this.context.fillStyle = 'rgba(76, 175, 80, 0.5)'
    this.markers.forEach(value => {
      this.context.fillRect(
        0, -1 + this.height - (value / maxData) * this.height, this.width, 3)
    })

    // this.text.innerHTML = `${this.name}: ${this.data[this.data.length - 1]}`

    this.leftScale.from = minData
    this.leftScale.to = maxData
    // this.leftScale.markers = [0, this.target, 1.2 * this.target]
    this.leftScale.draw()
    this.bottomScale.draw()
  }
}

class Heatmap {
  constructor (name, scales, width, height) {
    this.name = name
    this.scales = scales
    this.width = width
    this.height = height

    this.init = this.init.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('heatmap')

    this.text = makeTitle(`${this.name}:`)
    this.container.appendChild(this.text)

    this.canvas = window.document.createElement('canvas')
    this.canvas.classList.add('heatmapCanvas')
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.leftScale = new Scale(this.scales.yName, this.scales.yUnit, this.height, true)
    this.bottomScale = new Scale(this.scales.xName, this.scales.xUnit, this.width, false)

    this.container.appendChild(this.leftScale.container)
    this.container.appendChild(this.canvas)
    this.container.appendChild(window.document.createElement('br'))
    this.container.appendChild(this.bottomScale.container)

    // this.context = this.canvas.getContext('2d')

    this.draw()
  }

  draw (source) {
    // this.context.drawImage(source, 0, 0)

    // this.text.innerHTML = `${this.name}`

    // 43 rows
    this.leftScale.from = 0
    this.leftScale.to = 1.5
    this.leftScale.markers = utilities.generateArray(7, x => x / 4) // [0, 0.2, 0.4, 0.6, 0.8, 1]

    // 31 columns
    this.bottomScale.from = 0
    this.bottomScale.to = 5.0
    this.bottomScale.markers = utilities.generateArray(6) // [0, 1, 2, 3, 4, 5]

    this.leftScale.draw()
    this.bottomScale.draw()
  }
}

const scaleCanvasSizeLeft = 30
const scaleCanvasSizeBottom = 23
const scaleMarginSize = 10

class Scale {
  constructor (name, unit, size, isVertical) {
    this.name = name
    this.unit = unit
    this.size = size
    this.isVertical = isVertical

    this.init = this.init.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('scale')
    this.container.classList.add(this.isVertical ? 'left' : 'bottom')

    this.text = window.document.createElement('p')
    // this.text.appendChild(window.document.createTextNode(this.name))
    this.text.innerHTML = this.name
    this.container.appendChild(this.text)

    this.canvas = window.document.createElement('canvas')

    this.canvas.width = this.isVertical
      ? scaleCanvasSizeLeft
      : (this.size + 2 * scaleMarginSize)

    this.canvas.height = this.isVertical
      ? (this.size + 2 * scaleMarginSize)
      : scaleCanvasSizeBottom

    this.container.appendChild(this.canvas)

    this.context = this.canvas.getContext('2d')

    this.from = 0
    this.to = 0

    this.markers = []
  }

  draw () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = '#000000'
    this.context.textAlign = this.isVertical ? 'right' : 'center'
    this.context.font = '12px Century Gothic'

    // ;[this.from, ...this.markers, this.to].forEach(value => {
    this.markers.forEach(value => {
      const offset = (value - this.from) / (this.to - this.from)

      this.context.fillText(
        `${utilities.toNDigits(3, value)}${this.unit}`,
        this.isVertical ? 25 : offset * this.size + scaleMarginSize,
        this.isVertical ? (this.size - offset * this.size + scaleMarginSize + 4) : 15
      )
    })

    // this.context.fillRect(0, 0, this.width, this.height)
  }
}

export default class Controls {
  constructor () {
    this.init = this.init.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('controls')

    //

    this.buttonContainer = document.createElement('div')
    this.buttonContainer.id = 'buttonContainer'

    this.resetButton = new Button('Reset', './images/reset.png')
    this.buttonContainer.appendChild(this.resetButton.container)

    this.playPauseButton = new Button('Pause', './images/pause.png')
    this.buttonContainer.appendChild(this.playPauseButton.container)

    this.container.appendChild(this.buttonContainer)

    //

    this.mirrorToggle = new Toggle('Periodic display', true)
    this.container.appendChild(this.mirrorToggle.container)

    //

    this.gammaInput = new Slider(
      'Desired Gamma',
      Math.log(1),
      Math.log(500),
      Math.log(20),
      0.001,
      x => Math.round(Math.exp(x)))
    this.container.appendChild(this.gammaInput.container)

    this.kappaInput = new Slider('Desired Kappa', 1, 5, 2, 0.1)
    this.container.appendChild(this.kappaInput.container)

    //

    this.waveDispersionHeatmap = new Heatmap(
      'Wave Dispersion',
      { xName: 'k * a<sub>ws</sub>', xUnit: '', yName: 'ω / ω<sub>p</sub>', yUnit: '' },
      Math.round(physics.KLimit / physics.KStepSize) * 9.4,
      Math.round(physics.PlasmaFrequency / physics.OmegaStepSize) * 5
    )
    this.container.appendChild(this.waveDispersionHeatmap.container)

    //

    this.measuredGammaGraph = new Graph(
      'Measured Gamma',
      { xName: 'ω<sub>p</sub> * t', xUnit: '', yName: 'Γ', yUnit: '' },
      300, 215, 300, true
    )
    this.measuredGammaGraph.container.id = 'measuredGammaContainer'
    this.container.appendChild(this.measuredGammaGraph.container)

    this.pairCorrelationGraph = new Graph(
      'Pair Correlation',
      { xName: 'r / a<sub>ws</sub>', xUnit: '', yName: 'g', yUnit: '' },
      300, 215, 300, true, [1]
    )
    this.container.appendChild(this.pairCorrelationGraph.container)
  }
}
