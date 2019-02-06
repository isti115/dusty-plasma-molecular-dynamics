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
  constructor (name, min, max, defaultValue, stepSize, modifierFunction) {
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
    const innerValue = new window.Number(this.input.value)

    return (
      this.modifierFunction === undefined
        ? innerValue
        : this.modifierFunction(innerValue)
    )
  }

  set value (value) {
    this.input.value = value
  }
}

class Graph {
  constructor (name, width, height, dataLength) {
    this.name = name
    this.width = width
    this.height = height
    this.dataLength = dataLength

    this.init = this.init.bind(this)
    this.add = this.add.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('graph')

    this.text = window.document.createElement('p')
    this.container.appendChild(this.text)

    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.container.appendChild(this.canvas)

    this.context = this.canvas.getContext('2d')

    this.data = []
  }

  add (data) {
    this.data.push(data)

    while (this.data.length > this.dataLength) {
      this.data.shift()
    }

    this.draw()
  }

  draw () {
    this.context.fillStyle = '#FFFFFF'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const minData = Math.min(...this.data)
    const maxData = Math.max(...this.data)
    const scale = this.height / (maxData - minData)

    this.context.fillStyle = '#000000'
    this.data.forEach((d, i) => {
      this.context.fillRect(i, (this.height - scale * (d - minData)), 2, 2)
    })

    this.text.innerHTML = `${this.name}: ${this.data[this.data.length - 1]}`
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

    this.mirrorToggle = new Toggle('Periodic display', true)
    this.container.appendChild(this.mirrorToggle.container)

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

    this.kineticEnergyGraph = new Graph('Kinetic Energy', 300, 150, 300)
    this.container.appendChild(this.kineticEnergyGraph.container)
  }
}
