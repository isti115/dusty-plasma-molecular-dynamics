/* global utilities Complex fft Heatmap */

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
    this.bufferLength = 1024
    this.kCount = 50

    this.initBuffer()
  }

  initBuffer () {
    this.bufferData = []
    this.accumulatedData = utilities.generateArray(
      this.bufferLength,
      () => utilities.generateArray(this.kCount, () => 0)
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

      'xCoordinates': data => {
        const sd = utilities.generateArray(
          this.kCount,
          k => data.reduce(
            (sum, x) => (Complex.add(
              sum, Complex.exp(new Complex(0, (k + 1) * x)) // use k + 1 to skip 0
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

    for (let k = 0; k < this.kCount; k++) {
      for (let o = 0; o < this.bufferLength; o++) {
        this.accumulatedData[o][k] += rho2[k][o]
      }
    }

    this.accumulatedDataCount++
    this.heatmap.draw(this.accumulatedData, this.accumulatedDataCount)

    this.sendMessage({
      type: 'data',
      data: rho2
    })

    this.bufferData = []
  }
}

// Worker export:

this.FFTWorker = FFTWorker
