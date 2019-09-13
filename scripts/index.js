import App from './App.js'

const init = () => {
  window.app = new App(window.document.getElementById('app'))
}

window.addEventListener('load', init)
