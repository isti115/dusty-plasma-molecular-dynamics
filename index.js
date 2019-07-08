const { app, BrowserWindow, ipcMain } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1550,
    height: 820,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null)
  win.setResizable(false)

  ipcMain.addListener('mirrorToggle', (e, mirrorState) => {
    if (mirrorState) {
      win.setMinimumSize(1550, 820)
      win.setSize(1550, 820, true)
    } else {
      setTimeout(() => {
        win.setMinimumSize(1250, 785)
        win.setSize(1250, 785, true)
      }, 1000)
    }
  })

  // and load the index.html of the app.
  win.loadFile('www/index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.Copy

// --------------------
// ES6 Module fix:

// const { protocol } = require('electron')
// const nfs = require('fs')
// const npjoin = require('path').join
// const es6Path = npjoin(__dirname, 'www')

// protocol.registerStandardSchemes([ 'es6' ])

// app.on('ready', () => {
//   protocol.registerBufferProtocol('es6', (req, cb) => {
//     nfs.readFile(
//       npjoin(es6Path, req.url.replace('es6://', '')),
//       (e, b) => { cb({ mimeType: 'text/javascript', data: b }) }
//     )
//   })
// })

const { protocol } = require('electron')
const nfs = require('fs')
const npjoin = require('path').join
const es6Path = npjoin(__dirname, 'www')

protocol.registerSchemesAsPrivileged([{ scheme: 'es6', privileges: { standard: true, secure: true } }])

app.on('ready', async () => {
  protocol.registerBufferProtocol('es6', (req, cb) => {
    nfs.readFile(
      npjoin(es6Path, req.url.replace('es6://', '')),
      (e, b) => { cb({ mimeType: 'text/javascript', data: b }) }
    )
  })
  // await createWindow()
})

console.log(process.versions)
