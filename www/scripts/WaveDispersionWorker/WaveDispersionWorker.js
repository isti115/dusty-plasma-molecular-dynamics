/* global utilities physics Complex fft Heatmap */

class WaveDispersionWorker {
  constructor (postMessage) {
    // Storing parameters
    this.sendMessage = postMessage

    // Binding methods
    this.init = this.init.bind(this)
    this.initBuffer = this.initBuffer.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
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

  handleMessage (msg, source) {
    const messageHandlers = {
      'bufferOutputMessageChannels': data => {
        data.x.addEventListener('message', msg => this.handleMessage(msg.data, 'x'))
        data.y.addEventListener('message', msg => this.handleMessage(msg.data, 'y'))

        data.x.start()
        data.y.start()
      },

      'offscreenCanvas': data => {
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

      'processedCoordinates': (data, source) => {
        this.bufferData[source].push(data)

        if (this.bufferData[source].length === this.bufferLength) {
          // console.log('received data from: ', source)
          console.log(source, (new Date() - this.prevTime) / 1000)
          this.prevTime = new Date()

          this.process(this.bufferData[source])

          const averagedData = utilities.generateArray(
            this.accumulatedData.length,
            i => utilities.generateArray(
              this.accumulatedData[i].length,
              j => this.accumulatedData[i][j] / this.accumulatedDataCount
            )
          )

          this.heatmap.draw(averagedData, this.accumulatedDataCount)

          // this.sendMessage({
          //   type: 'data',
          //   data: averagedData
          // })

          this.bufferData[source] = []
        } else {
          this.heatmap.drawProgress(this.bufferData[source].length / this.bufferLength)
        }
      }
    }

    if (msg.type in messageHandlers) {
      messageHandlers[msg.type](msg.data, source)
    } else {
      console.log(`Unknown message type: ${msg.type}`)
    }
  }

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

this.WaveDispersionWorker = WaveDispersionWorker
