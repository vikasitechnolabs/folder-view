const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

// Select folder
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) return [];

  const folderPath = result.filePaths[0];

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .map((f) => path.join(folderPath, f));

  return files;
});

// Move to Rejected
ipcMain.handle("reject-image", async (event, filePath) => {
  const dir = path.join(path.dirname(filePath), "Rejected");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const newPath = path.join(dir, path.basename(filePath));
  fs.renameSync(filePath, newPath);

  return newPath;
});

// Move to Selected
ipcMain.handle("select-image", async (event, filePath) => {
  const dir = path.join(path.dirname(filePath), "Selected");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const newPath = path.join(dir, path.basename(filePath));
  fs.renameSync(filePath, newPath);

  return newPath;
});

// Undo move
ipcMain.handle("restore-image", async (event, oldPath, newPath) => {
  fs.renameSync(newPath, oldPath);
  return true;
});
