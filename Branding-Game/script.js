// Get all draggable items and drop zones
const dragItems = document.querySelectorAll('.drag-item');
const dropZones = document.querySelectorAll('.dropzone, .pool'); // pool also accepts drops
const pool = document.getElementById('item-pool');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');

// Store correct category mapping (data-category attribute)
// Zone IDs: zone-brand, zone-brandidentity, zone-visual
// We'll compare item.dataset.category with zone id suffix

// --- Drag and Drop Handlers ---
dragItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
});

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary for drop to work
}

function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    if (!draggable) return;

    // Find the inner container where items should be appended
    // Dropzones have a child div with class 'zone-items' (for categories) or are the pool itself
    let targetContainer = e.target.closest('.dropzone, .pool');
    if (!targetContainer) return;

    // If dropzone has .zone-items, append there, else append directly (for pool)
    const itemsContainer = targetContainer.querySelector('.zone-items');
    if (itemsContainer) {
        itemsContainer.appendChild(draggable);
    } else {
        targetContainer.appendChild(draggable);
    }

    // Remove any previous check classes when moved
    draggable.classList.remove('correct', 'incorrect');
}

// --- Check Answers ---
checkBtn.addEventListener('click', () => {
    // First, remove any previous feedback
    dragItems.forEach(item => item.classList.remove('correct', 'incorrect'));

    // Check if all items are placed in category zones (not in pool)
    const allItems = Array.from(dragItems);
    const itemsInPool = allItems.filter(item => item.closest('#item-pool') !== null);
    if (itemsInPool.length > 0) {
        alert('Please drag all items into the categories before checking.');
        return;
    }

    // Evaluate each item
    allItems.forEach(item => {
        const parentZone = item.closest('.dropzone'); // should be one of the three
        if (!parentZone) return;

        const zoneId = parentZone.id; // e.g., 'zone-brand'
        const itemCategory = item.dataset.category; // 'brand', 'brandidentity', 'visual'

        // Determine if correct: zone suffix matches category
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

// --- Reset: move all items back to pool ---
resetBtn.addEventListener('click', () => {
    dragItems.forEach(item => {
        pool.appendChild(item);
        item.classList.remove('correct', 'incorrect');
    });
});

// Optional: ensure draggable items remain draggable even after being moved (they keep the attribute)