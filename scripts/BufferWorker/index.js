/* global BufferWorker */
this.importScripts(
  '../shared/utilities.js',
  '../shared/physics.js',
  '../shared/Complex.js',
  'BufferWorker.js'
)

// Note: this === self at the top level.
const sendMessage = data => this.postMessage(data)

const bufferWorker = new BufferWorker(sendMessage)

this.addEventListener('message', msg => {
  bufferWorker.handleMessage(msg.data)
})
