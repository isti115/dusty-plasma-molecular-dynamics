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

export default class Controls {
  constructor () {
    this.init = this.init.bind(this)

    this.init()
  }

  init () {
    this.container = window.document.createElement('div')
    this.container.classList.add('controls')

    this.countInput = new Slider('Particle Count', 10, 100, 50)
    this.container.appendChild(this.countInput.container)

    this.temperatureInput = new Slider('Desired Temperature', 50, 150, 100)
    this.container.appendChild(this.temperatureInput.container)
  }
}
