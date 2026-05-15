const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  // Optional: open dev tools
  // win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// Select folder and return image paths
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (result.canceled) return []

  const folderPath = result.filePaths[0]

  const files = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => path.join(folderPath, f))

  return files
})

ipcMain.handle('delete-image', async (event, filePath) => {
  const dir = path.join(path.dirname(filePath), 'Rejected')

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const newPath = path.join(dir, path.basename(filePath))

  fs.renameSync(filePath, newPath)

  return true
})