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
    this.processCoordinates = this.processCoordinates.bind(this)
    this.process = this.process.bind(this)

    // Init
    this.init()
  }

  init () {
    this.bufferLength = physics.WaveDispersionBufferLength
    this.kCount = 1 + Math.floor(
      (3 * physics.BoxSize) / (2 * Math.PI * physics.WignerSeitzRadius)
    ) * 2
    this.deltaOmega = (2 * Math.PI) / (this.bufferLength * physics.dt)
    this.omegaCount = Math.round(1.5 * physics.PlasmaFrequency / this.deltaOmega)
    // console.log('omegaCount', this.omegaCount)
    // console.log('kCount', this.kCount)

    this.initBuffer()
    this.prevTime = new Date()
  }

  initBuffer () {
    this.bufferData = {
      x: [],
      y: []
    }

    this.accumulatedData = utilities.generateArray(
      this.omegaCount,
      () => utilities.generateArray(this.kCount, () => 0)
    )
    this.accumulatedDataCount = 0
  }

  reset () {
    this.initBuffer()

    if (this.heatmap) {
      // this.heatmap.clearProgress()
      this.heatmap.clear()
    }
  }

  processCoordinates (data) {
    return utilities.generateArray(
      this.kCount,
      m => utilities.generateArray(
        data.positions.length,
        i => (Complex.mul(
          new Complex(data.velocities[i], 0),
          Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * data.positions[i]))
        ))
      ).reduce((a, b) => Complex.add(a, b), new Complex(0, 0))
    )
  }

  // processCoordinates (data) {
  //   return utilities.generateArray(
  //     this.kCount,
  //     m => data.map(
  //       p => (Complex.mul(
  //         new Complex(p.vel, 0),
  //         Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * p.pos))
  //       ))
  //     ).reduce((a, b) => Complex.add(a, b), new Complex(0, 0))
  //   )
  // }

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

      'reset': data => {
        this.accumulatedDataCount = 0
      },

      'set': data => {
        this.accumulatedData = data.ad
        this.accumulatedDataCount = data.adc
      },

      'coordinates': data => {
        // const sd = utilities.generateArray(
        //   this.kCount,
        //   m => data.x.reduce(
        //     (sum, p) => (Complex.add(
        //       sum, Complex.mul(
        //         new Complex(p.vx, 0),
        //         Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * p.x)) // use k + 1 to skip 0
        //       )
        //     )),
        //     new Complex(0, 0)
        //   )
        // )

        // const sdY = utilities.generateArray(
        //   this.kCount,
        //   m => data.y.reduce(
        //     (sum, p) => (Complex.add(
        //       sum, Complex.mul(
        //         new Complex(p.vy, 0),
        //         Complex.exp(new Complex(0, m * (2 * Math.PI / physics.BoxSize) * p.y)) // use k + 1 to skip 0
        //       )
        //     )),
        //     new Complex(0, 0)
        //   )
        // )

        // const sd = utilities.generateArray(
        //   this.kCount,
        //   m => Complex.div(
        //     Complex.add(sdX[m], sdY[m]),
        //     new Complex(2, 0)
        //   )
        // )

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

        // this.bufferData.push(sd)

        const preparedData = {
          x: {
            positions: new Float64Array(data.x.positions),
            velocities: new Float64Array(data.x.velocities)
          },
          y: {
            positions: new Float64Array(data.y.positions),
            velocities: new Float64Array(data.y.velocities)
          }
        }

        this.bufferData.x.push(this.processCoordinates(preparedData.x))
        this.bufferData.y.push(this.processCoordinates(preparedData.y))

        // this.bufferData.push(this.processCoordinates(data.x))
        // this.bufferData.push(this.processCoordinates(data.y))

        if (this.bufferData.x.length === this.bufferLength) {
          console.log((new Date() - this.prevTime) / 1000)
          this.prevTime = new Date()

          this.process(this.bufferData.x)
          this.process(this.bufferData.y)

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

          this.bufferData = {
            x: [],
            y: []
          }
        } else {
          this.heatmap.drawProgress(this.bufferData.x.length / this.bufferLength)
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

  process (data) {
    // const t0 = performance.now()

    const flippedData = utilities.generateArray(
      this.kCount,
      i => utilities.generateArray(
        this.bufferLength,
        j => data[j][i]
      )
    )

    const rho2 = flippedData.map(d => fft.calculate(d)).map(
      (row, m) => row.map(x => m === 0 ? 0.1 : Complex.abs(x) ** 2)
    )

    // const t1 = performance.now()
    // console.log(`Process time: ${t1 - t0}ms`)

    for (let k = 0; k < this.kCount; k++) {
      for (let o = 0; o < this.omegaCount; o++) {
        this.accumulatedData[o][k] += rho2[k][o]
      }
    }

    this.accumulatedDataCount += 0.5
  }
}

// Worker export:

this.FFTWorker = FFTWorker
