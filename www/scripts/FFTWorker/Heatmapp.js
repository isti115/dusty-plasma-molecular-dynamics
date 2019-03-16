class Heatmap {
  constructor (canvas) {
    this.canvas = canvas

    this.init = this.init.bind(this)
    this.drawPixel = this.drawPixel.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    // this.canvas = new OffscreenCanvas(this.width, this.height)
    this.context = this.canvas.getContext('2d')

    this.scale = { x: 10, y: 4 }
  }

  drawPixel (x, y, value) {
    // this.context.fillStyle = `hsl(${hue}, 100%, 50%)`
    this.context.fillStyle = `hsl(${180 * Math.log(value) / Math.log(1000)}, 100%, 50%)`
    // this.context.fillStyle = `rgb(${255 * Math.log(hue) / Math.log(1000)}, 0, 0)`
    this.context.fillRect(x, y, this.scale.x, this.scale.y)
  }

  draw (data, n) {
    this.context.fillStyle = '#FFFFFF'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const minData = Math.min(...data.map(d => Math.min(...d)))
    const maxData = 1000 // Math.max(...data.map(d => Math.max(...d)))
    const scale = 1 / (maxData - minData)

    data.forEach((d, o) => {
      d.forEach((v, k) => {
        const value = (scale * (v - minData))
        this.drawPixel(this.scale.x * k, 300 - (this.scale.y * o), value / n)
      })
    })

    this.context.font = '30px Century Gothic'
    this.context.fillStyle = '#FFFFFF'
    this.context.fillText(n, 10, 30)
  }
}

// Worker export:

this.Heatmap = Heatmap
