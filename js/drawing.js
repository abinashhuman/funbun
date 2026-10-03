// Anayra's painting tools are shared by the painting game and birthday card.
// Drawing stays on this device until Anayra chooses to save or share it.
(() => {
  const root = document.querySelector('[data-studio]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const isInvitation = root.dataset.studio === 'invitation';
  // Keep the old card saved separately while starting the new sticker-free card.
  const storageKey = `anayra-${root.dataset.studio}-${isInvitation ? 'v2' : 'v1'}`;
  const message = root.querySelector('[data-message]');
  const undoButton = root.querySelector('[data-undo]');
  const redoButton = root.querySelector('[data-redo]');
  const sizeInput = root.querySelector('[data-size]');
  const sizeOutput = root.querySelector('[data-size-value]');
  const stickers = new Image();
  stickers.src = new URL('../assets/images/jj-mikey-stickers.png', document.currentScript.src).href;
  let color = '#7c5cff';
  let tool = 'brush';
  let size = Number(sizeInput.value);
  let drawing = false;
  let activePointer = null;
  let lastPoint = null;
  let undoStack = [];
  let redoStack = [];
  let initialized = false;
  let changed = false;
  const rainbowColors = ['#ff526e', '#ff963c', '#ffd34c', '#4bd39a', '#4fbaff', '#7c5cff'];

  function say(text) { message.textContent = text; }
  function snapshot() { return ctx.getImageData(0, 0, canvas.width, canvas.height); }
  function updateHistory() {
    undoButton.disabled = !undoStack.length;
    redoButton.disabled = !redoStack.length;
  }
  function remember() {
    undoStack.push(snapshot());
    if (undoStack.length > 16) undoStack.shift();
    redoStack = [];
    updateHistory();
  }
  function persist() {
    try { localStorage.setItem(storageKey, canvas.toDataURL('image/png')); }
    catch { say('Your picture is ready! Use Save picture to keep a copy.'); }
  }

  // The sticker sheet has JJ on the left and Mikey on the right.
  function sticker(which, x, y, width) {
    if (!stickers.complete || !stickers.naturalWidth) return;
    const half = stickers.naturalWidth / 2;
    const height = width * stickers.naturalHeight / half;
    ctx.drawImage(stickers, which === 'jj' ? 0 : half, 0, half, stickers.naturalHeight,
      x - width / 2, y - height / 2, width, height);
  }

  function drawBase() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!isInvitation) return;
    // Red and green blocks make a playful JJ and Mikey party border.
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.fillStyle = y % 60 ? '#b8eed0' : '#ffe0e4';
      ctx.fillRect(0, y, 22, 30);
      ctx.fillRect(canvas.width - 22, y, 22, 30);
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dd365a';
    ctx.font = 'bold 26px "Nunito", sans-serif';
    ctx.fillText("YOU'RE INVITED!", 350, 100);
    const nameGold = ctx.createLinearGradient(0, 145, 0, 215);
    nameGold.addColorStop(0, '#a56608');
    nameGold.addColorStop(.5, '#e7b73f');
    nameGold.addColorStop(1, '#b37a0c');
    ctx.fillStyle = nameGold;
    ctx.font = 'bold 68px "Baloo 2", sans-serif';
    ctx.fillText("ANAYRA'S", 350, 205);
    ctx.fillStyle = '#279d62';
    ctx.font = 'bold 58px "Baloo 2", sans-serif';
    ctx.fillText('Birthday Party', 350, 280);
    ctx.fillStyle = '#68587c';
    ctx.font = '24px "Nunito", sans-serif';
    ctx.fillText("Let's play, paint & celebrate!", 350, 340);
    const marks = [[90, 150], [590, 170], [110, 380], [570, 390], [80, 780], [605, 760]];
    marks.forEach(([x, y], i) => {
      ctx.fillStyle = i % 2 ? '#55c994' : '#ff819b';
      star(x, y, 13, 6);
    });
  }

  async function initialize() {
    if (initialized) return;
    initialized = true;
    // Wait for fonts so the saved card and its preview use the same lettering.
    await document.fonts.ready;
    if (changed) return;
    let saved;
    try { saved = localStorage.getItem(storageKey); } catch { /* Drawing still works. */ }
    if (saved) {
      const picture = new Image();
      picture.onload = () => {
        if (!changed) ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
      };
      picture.onerror = () => { if (!changed) drawBase(); };
      picture.src = saved;
    } else drawBase();
  }
  drawBase();
  stickers.onload = () => {
    root.querySelectorAll('[data-tool="jj"], [data-tool="mikey"]').forEach(button => { button.disabled = false; });
    initialize();
  };
  stickers.onerror = () => {
    say('The stickers could not load. You can still paint!');
    initialize();
  };
  if (stickers.complete && stickers.naturalWidth) stickers.onload();

  root.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', () => {
      color = button.dataset.color;
      root.querySelectorAll('[data-color]').forEach(swatch => {
        swatch.setAttribute('aria-pressed', String(swatch === button));
      });
    });
  });
  root.querySelectorAll('[data-tool]').forEach(button => {
    button.addEventListener('click', () => {
      tool = button.dataset.tool;
      root.querySelectorAll('[data-tool]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      say(['brush', 'glitter', 'rainbow-brush', 'eraser'].includes(tool)
        ? 'Drag on the picture to paint.' : 'Tap on the picture to add your shape or sticker.');
    });
  });
  sizeInput.addEventListener('input', () => {
    size = Number(sizeInput.value);
    sizeOutput.value = size;
  });

  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height };
  }
  function star(x, y, outer, inner) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = i * Math.PI / 5 - Math.PI / 2;
      const radius = i % 2 ? inner : outer;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  function stamp(x, y) {
    const radius = size * 2 + 18;
    ctx.save();
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, size / 3);
    if (tool === 'jj' || tool === 'mikey') sticker(tool, x, y, size * 4 + 45);
    else if (tool === 'amazing') {
      // A colorful word sticker that uses the color Anayra picked.
      ctx.translate(x, y); ctx.rotate(-.1);
      const scale = .7 + size / 32; ctx.scale(scale, scale);
      ctx.fillStyle = '#fff4c9'; ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(-95, -34, 190, 68, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 28px "Nunito", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AMAZING!', 0, 1);
      ctx.fillStyle = '#ffd166'; star(-84, -33, 13, 6); star(85, 32, 13, 6);
    }
    else if (tool === 'star') star(x, y, radius, radius * .45);
    else if (tool === 'circle') { ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
    else if (tool === 'square') ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    else if (tool === 'triangle') {
      ctx.beginPath(); ctx.moveTo(x, y - radius); ctx.lineTo(x + radius, y + radius);
      ctx.lineTo(x - radius, y + radius); ctx.closePath(); ctx.fill();
    } else if (tool === 'heart') {
      ctx.translate(x, y); ctx.scale(radius / 40, radius / 40);
      ctx.beginPath(); ctx.moveTo(0, 35);
      ctx.bezierCurveTo(-75, -12, -28, -63, 0, -22);
      ctx.bezierCurveTo(28, -63, 75, -12, 0, 35); ctx.fill();
    } else if (tool === 'spiral') {
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 6; t += .05) {
        const r = radius * t / (Math.PI * 6);
        const px = x + Math.cos(t) * r, py = y + Math.sin(t) * r;
        if (!t) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else if (tool === 'rainbow') {
      rainbowColors.forEach((shade, i) => {
        ctx.strokeStyle = shade; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(x, y + radius / 2, radius + 26 - i * 8, Math.PI, 0); ctx.stroke();
      });
    }
    ctx.restore();
  }
  function glitter(x, y) {
    for (let i = 0; i < 8; i++) {
      const gx = x + (Math.random() - .5) * size * 5;
      const gy = y + (Math.random() - .5) * size * 5;
      ctx.fillStyle = i % 3 ? color : '#ffd166';
      star(gx, gy, Math.random() * 3 + 1.5, 1);
    }
  }
  function stroke(from, to) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (tool === 'glitter') {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / Math.max(3, size)));
      for (let i = 0; i <= steps; i++) glitter(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
    } else if (tool === 'rainbow-brush') {
      ctx.lineWidth = Math.max(2, size / 4);
      rainbowColors.forEach((shade, i) => {
        const offset = (i - 2.5) * ctx.lineWidth;
        ctx.strokeStyle = shade; ctx.beginPath();
        ctx.moveTo(from.x, from.y + offset); ctx.lineTo(to.x + .01, to.y + offset); ctx.stroke();
      });
    } else {
      ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
      ctx.lineWidth = size * (tool === 'eraser' ? 3 : 1);
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x + .01, to.y); ctx.stroke();
    }
    ctx.restore();
  }

  canvas.addEventListener('pointerdown', event => {
    if (activePointer !== null || event.button > 0) return;
    changed = true; remember(); drawing = true; activePointer = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    lastPoint = point(event);
    if (['brush', 'glitter', 'rainbow-brush', 'eraser'].includes(tool)) stroke(lastPoint, lastPoint);
    else stamp(lastPoint.x, lastPoint.y);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing || event.pointerId !== activePointer) return;
    const next = point(event);
    if (['brush', 'glitter', 'rainbow-brush', 'eraser'].includes(tool)) stroke(lastPoint, next);
    lastPoint = next;
  });
  function finish(event) {
    if (event.pointerId !== activePointer) return;
    drawing = false; activePointer = null; lastPoint = null; persist();
  }
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('lostpointercapture', finish);
  // A sticker can also be dragged from its separate button onto the card.
  root.querySelectorAll('[data-tool][draggable="true"]').forEach(button => {
    button.addEventListener('dragstart', event => {
      if (button.disabled) { event.preventDefault(); return; }
      event.dataTransfer.setData('text/plain', button.dataset.tool);
      event.dataTransfer.effectAllowed = 'copy';
    });
  });
  canvas.addEventListener('dragover', event => {
    if (!event.dataTransfer.types.includes('text/plain')) return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'copy';
  });
  canvas.addEventListener('drop', event => {
    const dropped = event.dataTransfer.getData('text/plain');
    if (!['jj', 'mikey', 'amazing'].includes(dropped)) return;
    event.preventDefault();
    const button = root.querySelector(`[data-tool="${dropped}"]`);
    if (!button || button.disabled) return;
    button.click(); changed = true; remember();
    const location = point(event); stamp(location.x, location.y); persist();
    say('Sticker added! Pick another sticker whenever you like.');
  });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault(); changed = true; remember();
    const x = canvas.width / 2, y = canvas.height / 2;
    if (['brush', 'glitter', 'rainbow-brush', 'eraser'].includes(tool)) stroke({ x, y }, { x: x + 60, y });
    else stamp(x, y);
    persist();
  });
  undoButton.addEventListener('click', () => {
    if (!undoStack.length) return;
    changed = true; redoStack.push(snapshot()); ctx.putImageData(undoStack.pop(), 0, 0);
    updateHistory(); persist(); say('Undone!');
  });
  redoButton.addEventListener('click', () => {
    if (!redoStack.length) return;
    changed = true; undoStack.push(snapshot()); ctx.putImageData(redoStack.pop(), 0, 0);
    updateHistory(); persist(); say('Your drawing is back!');
  });
  root.querySelector('[data-reset]').addEventListener('click', () => {
    changed = true; remember(); drawBase(); persist(); say('A fresh start! You can undo this too.');
  });
  root.querySelector('[data-save]').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = isInvitation ? 'anayra-birthday-invitation.png' : 'anayra-painting.png';
    link.href = canvas.toDataURL('image/png'); link.click(); say('Your picture is saved!');
  });
  updateHistory();
})();
