// Get all draggable items and drop zones
const dragItems = document.querySelectorAll('.draggable-tile');
const dropZones = document.querySelectorAll('.dropzone');
const pool = document.getElementById('item-pool');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');

// --- Drag and Drop Handlers ---
dragItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
});
// Also allow dropping into the pool
pool.addEventListener('dragover', handleDragOver);
pool.addEventListener('drop', handleDrop);

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    if (!draggable) return;

    // Find where to append: if drop target is a dropzone, use its .zone-items; if pool, append directly
    const target = e.target.closest('.dropzone, .pool');
    if (!target) return;

    let targetContainer = target;
    if (target.classList.contains('dropzone')) {
        const zoneItems = target.querySelector('.zone-items');
        if (zoneItems) targetContainer = zoneItems;
    }

    targetContainer.appendChild(draggable);
    draggable.classList.remove('correct', 'incorrect');
}

// --- Check Answers ---
checkBtn.addEventListener('click', () => {
    dragItems.forEach(item => item.classList.remove('correct', 'incorrect'));

    // Check if any item is still in pool
    const itemsInPool = Array.from(dragItems).filter(item => item.closest('#item-pool'));
    if (itemsInPool.length > 0) {
        alert('Please drag all items into the categories before checking.');
        return;
    }

    dragItems.forEach(item => {
        const parentZone = item.closest('.dropzone');
        if (!parentZone) return; // shouldn't happen

        const zoneId = parentZone.id; // 'zone-brand', 'zone-brandidentity', 'zone-visual'
        const itemCategory = item.dataset.category; // 'brand', 'brandidentity', 'visual'

        let isCorrect = false;
        if (zoneId === 'zone-brand' && itemCategory === 'brand') isCorrect = true;
        if (zoneId === 'zone-brandidentity' && itemCategory === 'brandidentity') isCorrect = true;
        if (zoneId === 'zone-visual' && itemCategory === 'visual') isCorrect = true;

        if (isCorrect) {
            item.classList.add('correct');
        } else {
            item.classList.add('incorrect');
        }
    });
});

// --- Reset ---
resetBtn.addEventListener('click', () => {
    dragItems.forEach(item => {
        pool.appendChild(item);
        item.classList.remove('correct', 'incorrect');
    });
});
