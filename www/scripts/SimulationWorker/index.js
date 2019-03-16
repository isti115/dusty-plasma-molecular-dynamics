/* global SimulationWorker */
this.importScripts(
  'physics.js',
  'utilities.js',
  'Particle.js',
  'Simulation.js',
  'SimulationWorker.js'
)

// Note: this === self at the top level.
const sendMessage = data => this.postMessage(data)

const simulationWorker = new SimulationWorker(sendMessage)

this.addEventListener('message', msg => {
  simulationWorker.handleMessage(msg.data)
})
