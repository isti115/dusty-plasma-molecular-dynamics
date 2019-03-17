/* global FFTWorker */
this.importScripts(
  'utilities.js',
  'physics.js',
  'Complex.js',
  'fft.js',
  'Heatmapp.js',
  'FFTWorker.js'
)

// Note: this === self at the top level.
const sendMessage = data => this.postMessage(data)

const fftWorker = new FFTWorker(sendMessage)

this.addEventListener('message', msg => {
  fftWorker.handleMessage(msg.data)
})
