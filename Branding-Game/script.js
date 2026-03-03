// Get all tiles, slots, and control buttons
const tiles = document.querySelectorAll('.draggable-tile');
const slots = document.querySelectorAll('.slot');
const pool = document.getElementById('item-pool');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');

// Modal elements
const modal = document.getElementById('result-modal');
const scoreMessage = document.getElementById('score-message');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// Game state
let locked = false;
let draggedTile = null;      // for touch dragging
let touchOffsetX = 0, touchOffsetY = 0; // for positioning

// --- Shuffle function: randomizes order of tiles in pool ---
function shuffleTiles() {
  const tileArray = Array.from(tiles);
  // Fisher-Yates shuffle
  for (let i = tileArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tileArray[i], tileArray[j]] = [tileArray[j], tileArray[i]];
  }
  // Re-append in shuffled order to pool
  tileArray.forEach(tile => pool.appendChild(tile));
}

// --- Mouse drag events (desktop) ---
tiles.forEach(tile => {
  tile.addEventListener('dragstart', e => {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', tile.id);
    tile.classList.add('dragging');
  });
  tile.addEventListener('dragend', e => {
    tile.classList.remove('dragging');
  });
});

// --- Touch drag events (mobile) ---
tiles.forEach(tile => {
  tile.addEventListener('touchstart', handleTouchStart, { passive: false });
  tile.addEventListener('touchmove', handleTouchMove, { passive: false });
  tile.addEventListener('touchend', handleTouchEnd);
  tile.addEventListener('touchcancel', handleTouchEnd);
});

function handleTouchStart(e) {
  if (locked) {
    e.preventDefault();
    return;
  }
  e.preventDefault();
  const tile = e.target.closest('.draggable-tile');
  if (!tile) return;

  draggedTile = tile;
  const touch = e.touches[0];
  const rect = tile.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;

  tile.classList.add('dragging');
  tile.style.position = 'fixed';
  tile.style.zIndex = '1000';
  tile.style.left = (touch.clientX - touchOffsetX) + 'px';
  tile.style.top = (touch.clientY - touchOffsetY) + 'px';
  tile.style.width = rect.width + 'px';
  tile.style.height = rect.height + 'px';
  tile.style.pointerEvents = 'none';
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!draggedTile) return;

  const touch = e.touches[0];
  draggedTile.style.left = (touch.clientX - touchOffsetX) + 'px';
  draggedTile.style.top = (touch.clientY - touchOffsetY) + 'px';
}

function handleTouchEnd(e) {
  e.preventDefault();
  if (!draggedTile) return;

  const touch = e.changedTouches[0];
  const elemUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
  
  draggedTile.style.position = '';
  draggedTile.style.zIndex = '';
  draggedTile.style.left = '';
  draggedTile.style.top = '';
  draggedTile.style.width = '';
  draggedTile.style.height = '';
  draggedTile.style.pointerEvents = '';
  draggedTile.classList.remove('dragging');

  let target = elemUnderTouch.closest('.slot, #item-pool');
  if (target) {
    if (target.classList.contains('slot') && target.firstChild) {
      const oldTile = target.firstChild;
      pool.appendChild(oldTile);
    }
    target.appendChild(draggedTile);
    draggedTile.classList.remove('correct', 'incorrect');
  } else {
    pool.appendChild(draggedTile);
  }

  draggedTile = null;
}

// --- Make slots droppable (mouse) ---
slots.forEach(slot => {
  slot.addEventListener('dragover', e => e.preventDefault());
  slot.addEventListener('drop', e => {
    e.preventDefault();
    if (locked) return;

    const tileId = e.dataTransfer.getData('text/plain');
    const draggedTile = document.getElementById(tileId);
    if (!draggedTile) return;

    if (slot.firstChild) {
      const oldTile = slot.firstChild;
      pool.appendChild(oldTile);
    }
    slot.appendChild(draggedTile);
    draggedTile.classList.remove('correct', 'incorrect');
  });
});

// --- Pool drop handling (mouse) ---
pool.addEventListener('dragover', e => e.preventDefault());
pool.addEventListener('drop', e => {
  e.preventDefault();
  if (locked) return;

  const tileId = e.dataTransfer.getData('text/plain');
  const draggedTile = document.getElementById(tileId);
  if (draggedTile) {
    pool.appendChild(draggedTile);
    draggedTile.classList.remove('correct', 'incorrect');
  }
});

// --- Check answers ---
checkBtn.addEventListener('click', () => {
  tiles.forEach(t => t.classList.remove('correct', 'incorrect'));

  slots.forEach(slot => {
    const tile = slot.firstChild;
    if (!tile) return;

    const parentZone = slot.closest('#zone-brandidentity, #zone-visual');
    if (!parentZone) return;

    let expectedCategory = '';
    if (parentZone.id === 'zone-brandidentity') expectedCategory = 'brandidentity';
    else if (parentZone.id === 'zone-visual') expectedCategory = 'visual';

    if (tile.dataset.category === expectedCategory) {
      tile.classList.add('correct');
    } else {
      tile.classList.add('incorrect');
    }
  });

  const correctCount = document.querySelectorAll('.draggable-tile.correct').length;
  scoreMessage.textContent = `You got ${correctCount} out of ${tiles.length} correct!`;
  modal.style.display = 'flex';

  // Lock game
  locked = true;
  tiles.forEach(tile => tile.setAttribute('draggable', 'false'));
});

// --- Reset function (now also shuffles) ---
function resetGame() {
  // Move all tiles back to pool
  tiles.forEach(tile => {
    pool.appendChild(tile);
    tile.classList.remove('correct', 'incorrect');
  });

  // Shuffle the tiles for a fresh game
  shuffleTiles();

  // Unlock game
  locked = false;
  tiles.forEach(tile => tile.setAttribute('draggable', 'true'));

  modal.style.display = 'none';
}

resetBtn.addEventListener('click', resetGame);
tryAgainBtn.addEventListener('click', resetGame);

// --- Initial shuffle when page loads ---
shuffleTiles();
