// Pick a ride, dodge space rocks, and use multiplication to repair a bump.
(() => {
  const canvas = document.getElementById('flight-canvas');
  const ctx = canvas.getContext('2d');
  const setup = document.getElementById('rocket-setup');
  const overlay = document.getElementById('flight-overlay');
  const pauseButton = document.getElementById('pause-flight');
  const scoreLabel = document.getElementById('flight-score');
  const status = document.getElementById('flight-status');
  const answer = document.getElementById('repair-answer');
  const repairMessage = document.getElementById('repair-message');
  const panels = ['flight-welcome', 'repair-form', 'paused-panel', 'win-panel'];
  let state = 'ready';
  let ride = 'red';
  let name = 'Rainbow Rocket';
  let score = 0;
  let rocks = [];
  let spawnTime = 0;
  let immune = 0;
  let question = { a: 2, b: 2 };
  let position = { x: 480, y: 530 };
  const keys = new Set();
  const directionPointers = new Map();
  let dragPointer = null;
  let previousTime = 0;
  const stars = Array.from({ length: 75 }, (_, i) => ({ x: (i * 157 + 17) % 960, y: (i * 97 + 11) % 660, r: 1 + i % 3 / 2 }));

  function panel(id) {
    overlay.hidden = !id;
    panels.forEach(panelId => { document.getElementById(panelId).hidden = panelId !== id; });
  }
  function updateScore() { scoreLabel.textContent = `Rocks dodged: ${score} / 15`; }
  function clearControls() { keys.clear(); directionPointers.clear(); dragPointer = null; }
  function start() {
    name = document.getElementById('ride-name').value.trim() || (ride === 'meteor' ? 'Happy Meteor' : 'Rainbow Rocket');
    score = 0; rocks = []; spawnTime = .8; immune = 1.8; position = { x: 480, y: 530 };
    clearControls(); state = 'flying'; setup.hidden = true; setup.parentElement.classList.add('is-playing'); pauseButton.disabled = false;
    pauseButton.textContent = 'Pause'; panel(null); updateScore();
    status.textContent = `${name} is flying! Dodge the rocks.`;
    canvas.focus({ preventScroll: true });
  }
  setup.addEventListener('submit', event => { event.preventDefault(); start(); });
  document.querySelectorAll('[data-ride]').forEach(button => {
    button.addEventListener('click', () => {
      ride = button.dataset.ride;
      document.querySelectorAll('[data-ride]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      draw();
    });
  });
  function pause() {
    if (state !== 'flying') return;
    state = 'paused'; clearControls(); panel('paused-panel'); pauseButton.textContent = 'Resume';
    status.textContent = 'Paused. Your mission is waiting.';
    document.getElementById('resume-flight').focus({ preventScroll: true });
  }
  function resume() {
    if (state !== 'paused') return;
    state = 'flying'; clearControls(); panel(null); pauseButton.textContent = 'Pause';
    status.textContent = `${name} is flying!`; canvas.focus({ preventScroll: true });
  }
  pauseButton.addEventListener('click', () => state === 'paused' ? resume() : pause());
  document.getElementById('resume-flight').addEventListener('click', resume);
  document.getElementById('fly-again').addEventListener('click', start);
  document.getElementById('choose-ride').addEventListener('click', () => {
    state = 'ready'; clearControls(); rocks = []; score = 0; updateScore(); setup.hidden = false; setup.parentElement.classList.remove('is-playing');
    pauseButton.disabled = true; pauseButton.textContent = 'Pause'; panel('flight-welcome');
    status.textContent = 'Choose a new ride and give it a name!';
    document.getElementById('ride-name').focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', () => { clearControls(); pause(); });

  const directions = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
  document.addEventListener('keydown', event => {
    if (event.target.matches('input, select, textarea')) return;
    if (event.key === 'Escape') { state === 'paused' ? resume() : pause(); return; }
    const direction = directions[event.key] || directions[event.key.toLowerCase()];
    if (direction && state === 'flying') { event.preventDefault(); keys.add(direction); }
  });
  document.addEventListener('keyup', event => {
    const direction = directions[event.key] || directions[event.key.toLowerCase()];
    if (direction) keys.delete(direction);
  });
  document.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      if (state !== 'flying') return;
      event.preventDefault(); button.setPointerCapture(event.pointerId);
      directionPointers.set(event.pointerId, button.dataset.direction);
      move(button.dataset.direction, 28);
    });
    function release(event) { directionPointers.delete(event.pointerId); }
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    // Keyboard activation of the arrow buttons makes one useful step.
    button.addEventListener('click', event => {
      if (event.detail === 0 && state === 'flying') move(button.dataset.direction, 45);
    });
  });
  function move(direction, distance) {
    if (direction === 'left') position.x -= distance;
    if (direction === 'right') position.x += distance;
    if (direction === 'up') position.y -= distance;
    if (direction === 'down') position.y += distance;
    clamp();
  }
  function clamp() {
    position.x = Math.max(38, Math.min(922, position.x));
    position.y = Math.max(48, Math.min(602, position.y));
  }
  function drag(event) {
    const box = canvas.getBoundingClientRect();
    position.x = (event.clientX - box.left) * canvas.width / box.width;
    position.y = (event.clientY - box.top) * canvas.height / box.height;
    clamp();
  }
  canvas.addEventListener('pointerdown', event => {
    if (state !== 'flying' || dragPointer !== null) return;
    dragPointer = event.pointerId; canvas.setPointerCapture(event.pointerId); drag(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (state === 'flying' && event.pointerId === dragPointer) drag(event);
  });
  function endDrag(event) { if (event.pointerId === dragPointer) dragPointer = null; }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);

  function bump() {
    state = 'repair'; clearControls(); pauseButton.disabled = true;
    const easy = document.getElementById('math-level').value === 'easy';
    question = { a: 2 + Math.floor(Math.random() * (easy ? 4 : 9)), b: 2 + Math.floor(Math.random() * (easy ? 4 : 9)) };
    document.getElementById('repair-question').textContent = `${question.a} × ${question.b} = ?`;
    answer.value = ''; repairMessage.textContent = ''; panel('repair-form');
    status.textContent = 'A little bump! Multiplication will fix your ride.';
    answer.focus({ preventScroll: true });
  }
  document.getElementById('repair-form').addEventListener('submit', event => {
    event.preventDefault();
    if (state !== 'repair' || !answer.value.trim()) return;
    if (Number(answer.value) !== question.a * question.b) {
      repairMessage.textContent = `Try again! Add ${Array(question.a).fill(question.b).join(' + ')}.`;
      answer.select(); return;
    }
    rocks = rocks.filter(rock => Math.hypot(rock.x - position.x, rock.y - position.y) > rock.r + 150);
    immune = 2.5; state = 'flying'; panel(null); pauseButton.disabled = false;
    status.textContent = `You fixed ${name}! Keep flying!`; canvas.focus({ preventScroll: true });
  });
  function complete() {
    state = 'won'; clearControls(); pauseButton.disabled = true; panel('win-panel');
    document.getElementById('win-message').textContent = `${name} dodged 15 space rocks. You did it!`;
    status.textContent = 'Mission complete! You are a space explorer!';
    document.getElementById('fly-again').focus({ preventScroll: true });
  }

  function drawRock(x, y, radius, player = false) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = player ? '#ffb05a' : '#a19bad';
    ctx.strokeStyle = player ? '#ffd166' : '#ddd3e4'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const angle = i * Math.PI * 2 / 9, r = radius * (i % 2 ? .84 : 1);
      const px = Math.cos(angle) * r, py = Math.sin(angle) * r;
      if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = player ? '#dc7c35' : '#777187';
    [[-.3, -.25, .23], [.35, .2, .18], [-.15, .45, .13]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(cx * radius, cy * radius, r * radius, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
  function drawRide() {
    ctx.save(); ctx.translate(position.x, position.y);
    if (ride === 'meteor') {
      ctx.fillStyle = '#ff7657'; ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(0, 80); ctx.lineTo(20, 20); ctx.fill();
      drawRock(0, 0, 29, true);
    } else if (ride === 'green') {
      ctx.fillStyle = '#b3efff'; ctx.beginPath(); ctx.ellipse(0, -10, 23, 22, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#62dc9a'; ctx.beginPath(); ctx.ellipse(0, 9, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd166'; [-23, 0, 23].forEach(x => { ctx.beginPath(); ctx.arc(x, 9, 4, 0, Math.PI * 2); ctx.fill(); });
    } else {
      ctx.fillStyle = '#ffb44d'; ctx.beginPath(); ctx.moveTo(-12, 28); ctx.lineTo(0, 65 + Math.sin(performance.now() / 80) * 8); ctx.lineTo(12, 28); ctx.fill();
      ctx.fillStyle = ride === 'red' ? '#ff526e' : '#a07bff';
      ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(-32, 34); ctx.lineTo(32, 34); ctx.lineTo(18, 10); ctx.fill();
      ctx.fillStyle = '#f9f5ff'; ctx.beginPath(); ctx.moveTo(0, -42); ctx.bezierCurveTo(-27, -15, -22, 20, -16, 30);
      ctx.lineTo(16, 30); ctx.bezierCurveTo(22, 20, 27, -15, 0, -42); ctx.fill();
      ctx.fillStyle = ride === 'red' ? '#ff526e' : '#a07bff'; ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(-15, -17); ctx.lineTo(15, -17); ctx.fill();
      ctx.fillStyle = '#59c8ff'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    }
    if (immune > 0 && state === 'flying') {
      ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  function draw() {
    const background = ctx.createLinearGradient(0, 0, 960, 660);
    background.addColorStop(0, '#14102f'); background.addColorStop(1, '#242656');
    ctx.fillStyle = background; ctx.fillRect(0, 0, 960, 660);
    stars.forEach(star => { ctx.fillStyle = '#ffffffb0'; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#664aaa'; ctx.beginPath(); ctx.arc(835, 110, 60, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b89bea'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(835, 110, 96, 20, -.3, 0, Math.PI * 2); ctx.stroke();
    rocks.forEach(rock => drawRock(rock.x, rock.y, rock.r));
    drawRide();
  }
  function frame(time) {
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .04) : 0;
    previousTime = time;
    if (state === 'flying') {
      immune = Math.max(0, immune - dt);
      const active = new Set([...keys, ...directionPointers.values()]);
      active.forEach(direction => move(direction, dt * 370));
      spawnTime -= dt;
      if (spawnTime <= 0) {
        rocks.push({ x: 50 + Math.random() * 860, y: -50, r: 20 + Math.random() * 22, speed: 135 + score * 5 + Math.random() * 35 });
        spawnTime = Math.max(.65, 1.2 - score * .025);
      }
      for (const rock of rocks) {
        rock.y += rock.speed * dt;
        if (immune <= 0 && Math.hypot(rock.x - position.x, rock.y - position.y) < rock.r + 25) { bump(); break; }
      }
      if (state === 'flying') {
        const escaped = rocks.filter(rock => rock.y - rock.r > 660).length;
        if (escaped) {
          score = Math.min(15, score + escaped); rocks = rocks.filter(rock => rock.y - rock.r <= 660); updateScore();
          if (score >= 15) complete();
        }
      }
    }
    draw(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
