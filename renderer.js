let images = []
let index = 0

async function loadFolder() {
  images = await window.api.selectFolder()
  index = 0
  showImage()
}

function showImage() {
  if (!images.length) return

  if (index < 0) index = 0

  if (index >= images.length) {
    document.getElementById('preview').src = ''
    document.getElementById('prevPreview').src = ''
    document.getElementById('nextPreview').src = ''
    document.getElementById('counter').innerText = 'Done!'
    return
  }

  // Main image
  document.getElementById('preview').src = images[index]

  // Previous preview
  if (index > 0) {
    document.getElementById('prevPreview').src = images[index - 1]
  } else {
    document.getElementById('prevPreview').src = ''
  }

  // Next preview
  if (index < images.length - 1) {
    document.getElementById('nextPreview').src = images[index + 1]
  } else {
    document.getElementById('nextPreview').src = ''
  }

  document.getElementById('counter').innerText =
    `${index + 1} / ${images.length}`
}

// 👉 Next
function nextImage() {
  index++
  showImage()
}

// 👉 Previous
function prevImage() {
  index--
  if (index < 0) index = 0
  showImage()
}

// 👉 Delete + Next (moves file)
async function deleteAndNext() {
  const file = images[index]

  await window.api.deleteImage(file)

  // Remove from list
  images.splice(index, 1)

  showImage()
}

// 👉 Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!images.length) return

  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key.toLowerCase() === 'd') deleteAndNext()
})