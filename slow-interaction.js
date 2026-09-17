const root = document.documentElement;
const orbit = document.querySelector('.cursor-orbit');
const stage = document.getElementById('stage');
const cards = [...document.querySelectorAll('.tilt-card')];
const intensity = document.getElementById('intensity');
const intensityValue = document.getElementById('intensity-value');
const warning = document.querySelector('.performance-warning');
const fpsNode = document.getElementById('fps');
const modal = document.getElementById('interaction-modal');

let cursorX = innerWidth / 2;
let cursorY = innerHeight / 2;
let renderedX = cursorX;
let renderedY = cursorY;
let power = Number(intensity.value) / 100;
let loadEnabled = true;
let lastWarningAt = 0;

function artificialLongTask(milliseconds) {
  const started = performance.now();
  let value = 0;
  while (performance.now() - started < milliseconds) {
    value += Math.sin(Math.random() * 1000) * Math.cos(value);
  }
  return value;
}

addEventListener('pointermove', event => {
  cursorX = event.clientX;
  cursorY = event.clientY;

  // This repeated layout read is intentionally inefficient for the lesson demo.
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom) {
      const rotateY = ((cursorX - rect.left) / rect.width - .5) * 22 * power;
      const rotateX = ((cursorY - rect.top) / rect.height - .5) * -22 * power;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      if (loadEnabled) artificialLongTask(18 * power);
    } else {
      card.style.transform = '';
    }
  });
});

function renderCursor() {
  renderedX += (cursorX - renderedX) * .09;
  renderedY += (cursorY - renderedY) * .09;
  orbit.style.transform = `translate3d(${renderedX - 43}px,${renderedY - 43}px,0) scale(${.75 + power * .45})`;
  stage.style.setProperty('--pointer-x', `${cursorX}px`);
  // Intentionally consume most of every frame so cursor and animation input visibly lag.
  if (loadEnabled) artificialLongTask(12 + 44 * power);
  requestAnimationFrame(renderCursor);
}
renderCursor();

intensity.addEventListener('input', () => {
  power = Number(intensity.value) / 100;
  intensityValue.textContent = `${intensity.value}%`;
  root.style.setProperty('--motion-power', power);
  if (loadEnabled) artificialLongTask(110 * power);
  warning.classList.add('visible');
  clearTimeout(window.warningTimer);
  window.warningTimer = setTimeout(() => warning.classList.remove('visible'), 1500);
});

cards.forEach(card => card.addEventListener('pointerleave', () => { card.style.transform = ''; }));

document.getElementById('launch').addEventListener('click', () => {
  const label = document.getElementById('launch-label');
  label.textContent = loadEnabled ? 'Input queued…' : 'Launch interaction';
  requestAnimationFrame(() => {
    if (loadEnabled) artificialLongTask(850);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    warning.classList.add('visible');
    label.textContent = 'Launch interaction';
  });
});

document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  warning.classList.remove('visible');
});

let frames = 0;
let lastSample = performance.now();
function sampleFps(now) {
  frames += 1;
  if (now - lastSample >= 700) {
    const measuredFps = Math.min(60, Math.round(frames * 1000 / (now - lastSample)));
    fpsNode.textContent = measuredFps;
    document.getElementById('performance-state').textContent = loadEnabled ? 'OVERLOADED' : 'OPTIMIZED';
    document.body.classList.toggle('load-disabled', !loadEnabled);
    if (loadEnabled && measuredFps < 30 && now - lastWarningAt > 3200) {
      warning.classList.add('visible');
      clearTimeout(window.warningTimer);
      window.warningTimer = setTimeout(() => warning.classList.remove('visible'), 1700);
      lastWarningAt = now;
    }
    frames = 0;
    lastSample = now;
  }
  requestAnimationFrame(sampleFps);
}
requestAnimationFrame(sampleFps);

document.getElementById('load-toggle').addEventListener('click', event => {
  loadEnabled = !loadEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(loadEnabled));
  event.currentTarget.textContent = loadEnabled ? 'Disable load' : 'Enable load';
  document.getElementById('performance-state').textContent = loadEnabled ? 'OVERLOADED' : 'OPTIMIZED';
  warning.classList.toggle('visible', loadEnabled);
});

// Startup work is deliberately excessive so performance tools can flag it.
artificialLongTask(1400);
