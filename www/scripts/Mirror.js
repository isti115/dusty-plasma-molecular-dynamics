export default class Mirror {
  constructor (source, horizontalCount, verticalCount) {
    this.source = source
    this.horizontalCount = horizontalCount
    this.verticalCount = verticalCount

    this.init = this.init.bind(this)
    this.draw = this.draw.bind(this)

    this.init()
  }

  init () {
    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.source.width * this.horizontalCount
    this.canvas.height = this.source.height * this.verticalCount

    this.canvas.classList.add('mirror')

    this.context = this.canvas.getContext('2d')
  }

  draw (periodic) {
    if (periodic) {
      this.canvas.classList.add('big')
    } else {
      this.canvas.classList.remove('big')
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (periodic) {
      ;[...new Array(this.horizontalCount)].forEach((_, x) => {
        [...new Array(this.verticalCount)].forEach((_, y) => {
          this.context.drawImage(
            this.source,
            x * this.source.width,
            y * this.source.height
          )
        })
      })
    } else {
      this.context.drawImage(
        this.source,
        this.source.width,
        this.source.height
      )
    }

    this.context.lineWidth = 1
    this.context.strokeStyle = 'rgba(128, 128, 128, 0.5)'
    this.context.strokeRect(
      this.source.width,
      this.source.height,
      this.source.width,
      this.source.height
    )
  }
}
