class Heatmap {
  constructor (canvas) {
    this.canvas = canvas

    this.init = this.init.bind(this)
    this.drawProgress = this.drawProgress.bind(this)
    this.drawPixel = this.drawPixel.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    // this.canvas = new OffscreenCanvas(this.width, this.height)
    this.context = this.canvas.getContext('2d')

    // this.innerCanvas = new OffscreenCanvas(13, 43)
    // this.innerContext = this.innerCanvas.getContext('2d')

    this.scale = { x: 7, y: 5 }
  }

  drawProgress (progress) {
    this.context.fillStyle = '#4CAF50'
    this.context.fillRect(0, 0, progress * this.canvas.width, 3)
  }

  drawPixel (x, y, value) {
    const intensity = 255 * value

    // this.context.fillStyle = `hsl(${hue}, 100%, 50%)`
    // this.context.fillStyle = `hsl(${180 * Math.log(value) / Math.log(1000)}, 100%, 50%)`
    this.context.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`
    // this.innerContext.fillRect(x, 43 - y, 1, 1)
    // this.context.fillRect(x, 43 - y, 1, 1)
    this.context.fillRect(
      this.scale.x * x,
      this.canvas.height - this.scale.y * y,
      this.scale.x,
      this.scale.y
    )
  }

  draw (data, n) {
    this.context.fillStyle = '#FFFFFF'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const minData = Math.min(...data.map(d => Math.min(...d)))
    const maxData = Math.max(...data.map(d => Math.max(...d)))

    const scale = 1 / (maxData - minData)

    const logMin = Math.log(0.01 * maxData)
    const logMax = Math.log(maxData)
    const logScale = 1 / (logMax - logMin)

    // console.log(`min: ${minData}, max: ${maxData}`)

    data.forEach((d, o) => {
      d.forEach((v, k) => {
        // const normedValue = (scale * (v - minData))
        const normedValue = (logScale * (Math.log(v) - logMin))
        this.drawPixel(k, (o + 1), normedValue)
      })
    })

    // this.context.drawImage(this.innerCanvas, 0, 0, this.scale.x, this.scale.y)
    this.context.font = '30px Century Gothic'
    this.context.fillStyle = '#FFFFFF'
    this.context.fillText(n, 10, 30)
  }
}

// Worker export:

this.Heatmap = Heatmap
