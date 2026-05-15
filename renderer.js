let images = []
let index = 0

let selectedCount = 0
let rejectedCount = 0

let history = []

async function loadFolder() {
  images = await window.api.selectFolder()
  index = 0
  selectedCount = 0
  rejectedCount = 0
  history = []
  showImage()
}

function showImage() {
  if (!images.length) return

  if (index < 0) index = 0

  if (index >= images.length) {
    document.getElementById('preview').src = ''
    document.getElementById('counter').innerText = 'Done!'
    return
  }

  const img = images[index]

  document.getElementById('preview').src = img
  document.getElementById('counter').innerText =
    `${index + 1} / ${images.length}`

  document.getElementById('stats').innerText =
    `Selected: ${selectedCount} | Rejected: ${rejectedCount}`

  // prev
  document.getElementById('prevPreview').src =
    index > 0 ? images[index - 1] : ''

  // next
  document.getElementById('nextPreview').src =
    index < images.length - 1 ? images[index + 1] : ''

  // preload next
  if (images[index + 1]) {
    new Image().src = images[index + 1]
  }
}

function showOverlay(text, color) {
  const overlay = document.getElementById('overlay')
  overlay.innerText = text
  overlay.style.color = color

  setTimeout(() => {
    overlay.innerText = ''
  }, 500)
}

// NAVIGATION
function nextImage() {
  index++
  showImage()
}

function prevImage() {
  index--
  showImage()
}

// KEEP
async function keepImage() {
  const file = images[index]
  const newPath = await window.api.selectImage(file)

  history.push({ type: 'keep', oldPath: file, newPath })

  selectedCount++
  images.splice(index, 1)

  showOverlay('SELECTED', 'lime')
  showImage()
}

// REJECT
async function rejectImage() {
  const file = images[index]
  const newPath = await window.api.rejectImage(file)

  history.push({ type: 'reject', oldPath: file, newPath })

  rejectedCount++
  images.splice(index, 1)

  showOverlay('REJECTED', 'red')
  showImage()
}

// UNDO
async function undo() {
  const last = history.pop()
  if (!last) return

  await window.api.restoreImage(last.oldPath, last.newPath)

  images.splice(index, 0, last.oldPath)

  if (last.type === 'keep') selectedCount--
  if (last.type === 'reject') rejectedCount--

  showOverlay('UNDO', 'yellow')
  showImage()
}

// KEYBOARD
document.addEventListener('keydown', (e) => {
  if (!images.length) return

  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key.toLowerCase() === 'd') rejectImage()
  if (e.key.toLowerCase() === 'k' || e.key === ' ') keepImage()
  if (e.key === 'Backspace') undo()
})