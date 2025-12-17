let currentImage = null;
let splitPosition = 0.5;
let canvas, ctx;

// demo photos
const samplePhotos = [
    { id: 1, src: 'https://images.unsplash.com/photo-1571896349840-f9d43fa9d9f4?w=300', location: 'India Gate 2025', era: 'Present' },
    { id: 2, src: 'https://images.unsplash.com/photo-1580130774212-63ec7b71540e?w=300', location: 'India Gate 1980s', era: 'Past' }
];

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('photoCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;

    setupTabs();
    populateGallery();
    setupSplitDivider();
    setupControls();
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            const target = e.currentTarget;
            target.classList.add('active');
            const tabName = target.getAttribute('data-tab');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function populateGallery() {
    const grid = document.getElementById('photoGrid');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    samplePhotos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `
            <img src="${photo.src}" alt="${photo.location}">
            <div class="photo-overlay">
                ${photo.location}<br><small>${photo.era}</small>
            </div>
        `;
        card.onclick = () => loadPhotoForEditing(photo.src);
        grid.appendChild(card);
    });

    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadPhoto);
}

function loadPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        loadPhotoForEditing(e.target.result);
    };
    reader.readAsDataURL(file);
}

function loadPhotoForEditing(src) {
    currentImage = new Image();
    currentImage.onload = () => {
        canvas.width = 600;
        canvas.height = 600;
        drawSplitView();
        // switch to editor tab
        document.querySelector('.tab[data-tab="editor"]').click();
    };
    currentImage.src = src;
}

function setupSplitDivider() {
    const divider = document.getElementById('splitDivider');
    let isDragging = false;

    divider.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        splitPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        divider.style.left = `${splitPosition * 100}%`;
        drawSplitView();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function drawSplitView() {
    if (!currentImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // left: modern
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width * splitPosition, canvas.height);
    ctx.clip();
    ctx.filter = 'none';
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // right: historical
    ctx.save();
    ctx.beginPath();
    ctx.rect(canvas.width * splitPosition, 0, canvas.width * (1 - splitPosition), canvas.height);
    ctx.clip();
    ctx.filter = 'sepia(0.4) contrast(1.1) brightness(0.9)';
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // grain
    const grain = document.getElementById('grainSlider').value / 100;
    if (grain > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function setupControls() {
    document.getElementById('timeSlider').addEventListener('input', () => drawSplitView());
    document.getElementById('grainSlider').addEventListener('input', () => drawSplitView());
    document.getElementById('filmSelect').addEventListener('change', () => drawSplitView());

    document.getElementById('savePresetBtn').addEventListener('click', () =>
        alert('Custom preset saved to K-Lens memory! 🔄 Bluetooth sync complete.')
    );

    document.getElementById('exportBtn').addEventListener('click', () => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'kodak-reality-photo.jpg';
            a.click();
        });
    });

    document.getElementById('igBtn').addEventListener('click', () =>
        alert('Sharing to Instagram with AR metadata tag! 📱✨')
    );
    document.getElementById('ttBtn').addEventListener('click', () =>
        alert('TikTok export with 1980s overlay effect! 🎬')
    );
}

