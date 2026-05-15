let images = []
let index = 0

let selectedCount = 0
let rejectedCount = 0
let skipped = new Set()

let history = []

const SESSION_FILE = 'photo-session'

// LOAD SESSION
function loadSession() {
  const data = localStorage.getItem(SESSION_FILE)
  if (!data) return false

  const parsed = JSON.parse(data)

  images = parsed.images
  index = parsed.index
  selectedCount = parsed.selectedCount
  rejectedCount = parsed.rejectedCount
  skipped = new Set(parsed.skipped || [])
  history = parsed.history || []

  return true
}

// SAVE SESSION
function saveSession() {
  const data = {
    images,
    index,
    selectedCount,
    rejectedCount,
    skipped: Array.from(skipped),
    history
  }

  localStorage.setItem(SESSION_FILE, JSON.stringify(data))
}

// LOAD FOLDER
async function loadFolder() {
  const resumed = loadSession()

  if (!resumed) {
    images = await window.api.selectFolder()
    index = 0
    selectedCount = 0
    rejectedCount = 0
    skipped.clear()
    history = []
  }

  showImage()
}

// UI UPDATE
function showImage() {
  if (!images.length) return

  if (index < 0) index = 0

  if (index >= images.length) {
    document.getElementById('preview').src = ''
    document.getElementById('counter').innerText = 'Done!'
    return
  }

  document.getElementById('preview').src = images[index]

  document.getElementById('counter').innerText =
    `${index + 1} / ${images.length}`

  document.getElementById('stats').innerText =
    `Selected: ${selectedCount} | Rejected: ${rejectedCount} | Skipped: ${skipped.size}`

  // progress
  const progress = ((index + 1) / images.length) * 100
  document.getElementById('progressBar').style.width = progress + '%'

  // previews
  document.getElementById('prevPreview').src =
    index > 0 ? images[index - 1] : ''

  document.getElementById('nextPreview').src =
    index < images.length - 1 ? images[index + 1] : ''

  // preload
  if (images[index + 1]) new Image().src = images[index + 1]

  saveSession()
}

// OVERLAY
function showOverlay(text, color) {
  const overlay = document.getElementById('overlay')
  overlay.innerText = text
  overlay.style.color = color

  setTimeout(() => {
    overlay.innerText = ''
  }, 500)
}

// NAV
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

// SKIP
function skipImage() {
  skipped.add(images[index])
  index++
  showOverlay('SKIPPED', 'orange')
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
  if (e.key.toLowerCase() === 's') skipImage()
})