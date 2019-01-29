import App from './App.js'

const init = () => {
  window.app = new App(window.document.body)
}

window.addEventListener('load', init)
