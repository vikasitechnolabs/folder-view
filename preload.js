const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  rejectImage: (file) => ipcRenderer.invoke("reject-image", file),
  selectImage: (file) => ipcRenderer.invoke("select-image", file),
  restoreImage: (oldPath, newPath) =>
    ipcRenderer.invoke("restore-image", oldPath, newPath),
});
