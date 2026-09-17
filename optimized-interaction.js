const orbit = document.querySelector('.cursor-orbit');
const cards = [...document.querySelectorAll('.tilt-card')];
const intensity = document.getElementById('intensity');
const intensityValue = document.getElementById('intensity-value');
const fpsNode = document.getElementById('fps');
const modal = document.getElementById('interaction-modal');

let power = Number(intensity.value) / 100;
let cursorX = innerWidth / 2;
let cursorY = innerHeight / 2;
let framePending = false;

addEventListener('pointermove', event => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(() => {
    orbit.style.transform = `translate3d(${cursorX - 11}px,${cursorY - 11}px,0)`;
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const inside = cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom;
      if (!inside) return;
      const rotateY = ((cursorX - rect.left) / rect.width - .5) * 10 * power;
      const rotateX = ((cursorY - rect.top) / rect.height - .5) * -10 * power;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });
    framePending = false;
  });
}, { passive: true });

cards.forEach(card => card.addEventListener('pointerleave', () => { card.style.transform = ''; }));

intensity.addEventListener('input', () => {
  power = Number(intensity.value) / 100;
  intensityValue.textContent = `${intensity.value}%`;
});

document.getElementById('launch').addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('close-modal').focus();
});

document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('launch').focus();
});

let frames = 0;
let lastSample = performance.now();
function sampleFps(now) {
  frames += 1;
  if (now - lastSample >= 1000) {
    fpsNode.textContent = Math.min(60, Math.round(frames * 1000 / (now - lastSample)));
    frames = 0;
    lastSample = now;
  }
  requestAnimationFrame(sampleFps);
}
requestAnimationFrame(sampleFps);
