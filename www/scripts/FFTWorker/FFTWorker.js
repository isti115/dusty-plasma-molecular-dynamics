/* global utilities physics Complex fft Heatmap */

class FFTWorker {
  constructor (postMessage) {
    // Storing parameters
    this.sendMessage = postMessage

    // Binding methods
    this.init = this.init.bind(this)
    this.initBuffer = this.initBuffer.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    // this.handleData = this.handleData.bind(this)
    this.process = this.process.bind(this)

    // Init
    this.init()
  }

  init () {
    this.bufferLength = 8192
    this.kCount = 1 + Math.floor(
      (3 * physics.BoxSize) / (2 * Math.PI * physics.WignerSeitzRadius)
    )
    this.deltaOmega = (2 * Math.PI) / (this.bufferLength * physics.dt)
    this.omegaCount = Math.round(physics.PlasmaFrequency / this.deltaOmega)
    console.log('omegaCount', this.omegaCount)
    console.log('kCount', this.kCount)

    this.initBuffer()
  }

  initBuffer () {
    this.bufferData = []
    this.accumulatedData = utilities.generateArray(
      this.omegaCount,
      () => utilities.generateArray(this.kCount - 1, () => 0)
    )
    this.accumulatedDataCount = 0
  }

  handleMessage (msg) {
    const messageHandlers = {
      'fftPort2': data => {
        data.addEventListener('message', msg => this.handleMessage(msg.data))
        data.start()
        // data.addEventListener(this.handleData)

        // data.postMessage(
        //   {
        //     type: 'canvas',
        //     data: this.heatmap.canvas
        //   },
        //   [
        //     this.heatmap.canvas
        //   ]
        // )
      },

      'canvas': data => {
        this.heatmap = new Heatmap(data)
      },

      'call': data => {
        this[data.name](...data.arguments)
      },

      'set': data => {
        this.accumulatedData = data.ad
        this.accumulatedDataCount = data.adc
      },

      'xCoordinates': data => {
        const sd = utilities.generateArray(
          this.kCount,
          m => data.reduce(
            (sum, p) => (Complex.add(
              sum, Complex.mul(
                new Complex(p.vx, 0),
                Complex.exp(new Complex(0, (m + 1) * (2 * Math.PI / physics.BoxSize) * p.x)) // use k + 1 to skip 0
              )
            )),
            new Complex(0, 0)
          )
        )

        // const summedList = []

        // for (let k = 1; k <= 30; k++) {
        //   let summedData = new Complex(0, 0)

        //   for (const p of data) {
        //     summedData = Complex.add(
        //       summedData,
        //       Complex.exp(new Complex(0, k * p))
        //     )
        //   }

        //   summedList.push(summedData)
        // }

        this.bufferData.push(sd)

        if (this.bufferData.length === this.bufferLength) {
          this.process()
        } else {
          this.heatmap.drawProgress(this.bufferData.length / this.bufferLength)
        }
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }

  // handleData () {

  // }

  process () {
    // const t0 = performance.now()

    const flippedData = utilities.generateArray(
      this.kCount,
      i => utilities.generateArray(
        this.bufferLength,
        j => this.bufferData[j][i]
      )
    )

    const rho2 = flippedData.map(d => fft.calculate(d)).map(
      row => row.map(x => Complex.abs(x) ** 2)
    )

    // const t1 = performance.now()
    // console.log(`Process time: ${t1 - t0}ms`)

    for (let k = 0; k < this.kCount - 1; k++) {
      for (let o = 0; o < this.omegaCount; o++) {
        this.accumulatedData[o][k] += rho2[k + 1][o + 1]
      }
    }

    this.accumulatedDataCount++

    const averagedData = utilities.generateArray(
      this.accumulatedData.length,
      i => utilities.generateArray(
        this.accumulatedData[i].length,
        j => this.accumulatedData[i][j] / this.accumulatedDataCount
      )
    )

    this.heatmap.draw(averagedData, this.accumulatedDataCount)

    this.sendMessage({
      type: 'data',
      data: averagedData
    })

    this.bufferData = []
  }
}

// Worker export:

this.FFTWorker = FFTWorker
