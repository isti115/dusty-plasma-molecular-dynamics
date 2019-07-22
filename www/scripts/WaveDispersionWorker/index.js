/* global WaveDispersionWorker */
this.importScripts(
  '../shared/utilities.js',
  '../shared/physics.js',
  '../shared/Complex.js',
  'fft.js',
  'Heatmap.js',
  'WaveDispersionWorker.js'
)

// Note: this === self at the top level.
const sendMessage = data => this.postMessage(data)

const waveDispersionWorker = new WaveDispersionWorker(sendMessage)

this.addEventListener('message', msg => {
  waveDispersionWorker.handleMessage(msg.data)
})
