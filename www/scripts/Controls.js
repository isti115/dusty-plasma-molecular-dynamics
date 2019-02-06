class Slider {
  constructor (name, min, max, defaultValue) {
    this.name = name
    this.min = min
    this.max = max
    this.defaultValue = defaultValue

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
    this.input.addEventListener('input', this.updateText)
    this.container.appendChild(this.input)

    this.updateText()
  }

  updateText () {
    this.text.innerHTML = `${this.name}: ${this.input.value}`
  }

  get value () {
    return this.input.value
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

    this.countInput = new Slider('Particle Count', 0, 100, 50)
    this.container.appendChild(this.countInput.container)

    this.temperatureInput = new Slider('Desired Temperature', 0, 500, 250)
    this.container.appendChild(this.temperatureInput.container)

    this.kineticEnergyGraph = new Graph('Kinetic Energy', 300, 150, 300)
    this.container.appendChild(this.kineticEnergyGraph.container)
  }
}
