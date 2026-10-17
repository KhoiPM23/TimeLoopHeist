import { soundFX } from './audio/soundFX';
import { GameRenderer } from './renderer/gameView';
import { TimeLoopEngine } from './simulation/engine';
import { LEVEL_1 } from './simulation/level1';
import { PlayerInput, SimEvent } from './simulation/types';

// DOM Elements
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const loopBadge = document.getElementById('loopBadge') as HTMLElement;
const timeBarFill = document.getElementById('timeBarFill') as HTMLElement;
const objStatus = document.getElementById('objStatus') as HTMLElement;
const secStatus = document.getElementById('secStatus') as HTMLElement;
const timeStatus = document.getElementById('timeStatus') as HTMLElement;

const btnRewind = document.getElementById('btnRewind') as HTMLButtonElement;
const btnReset = document.getElementById('btnReset') as HTMLButtonElement;
const btnMute = document.getElementById('btnMute') as HTMLButtonElement;
const btnHelp = document.getElementById('btnHelp') as HTMLButtonElement;
const muteLabel = document.getElementById('muteLabel') as HTMLElement;

const modalBrief = document.getElementById('modalBrief') as HTMLElement;
const btnStartBrief = document.getElementById('btnStartBrief') as HTMLButtonElement;
const modalWin = document.getElementById('modalWin') as HTMLElement;
const btnPlayAgain = document.getElementById('btnPlayAgain') as HTMLButtonElement;
const modalBusted = document.getElementById('modalBusted') as HTMLElement;
const bustedReason = document.getElementById('bustedReason') as HTMLElement;
const btnRetryLoop = document.getElementById('btnRetryLoop') as HTMLButtonElement;
const btnRestartAll = document.getElementById('btnRestartAll') as HTMLButtonElement;

// Initialization
const engine = new TimeLoopEngine(LEVEL_1);
const renderer = new GameRenderer(canvas);

// Input state
const keys: Record<string, boolean> = {};
let isGameActive = false;
let isAudioMuted = false;

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  soundFX.ensureAudioActive();

  if (e.key === 'r' || e.key === 'R') {
    handleRewind();
  }
  if (e.key === 'f' || e.key === 'F') {
    handleResetAll();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function pollInput(): PlayerInput {
  let dx = 0;
  let dy = 0;

  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  const interact = !!(keys[' '] || keys['e']);
  return { dx, dy, interact };
}

function handleRewind(): void {
  if (!isGameActive) return;
  soundFX.playRewind();
  modalBusted.classList.add('hidden');
  const advanced = engine.rewindToNextLoop();
  if (!advanced) {
    // If exceeded max loops, reset
    engine.resetEntireRun();
  }
  updateHUD();
}

function handleResetAll(): void {
  soundFX.playRewind();
  engine.resetEntireRun();
  modalBusted.classList.add('hidden');
  modalWin.classList.add('hidden');
  updateHUD();
}

// Button listeners
btnStartBrief.addEventListener('click', () => {
  modalBrief.classList.add('hidden');
  isGameActive = true;
  soundFX.ensureAudioActive();
});

btnHelp.addEventListener('click', () => {
  modalBrief.classList.remove('hidden');
});

btnRewind.addEventListener('click', () => {
  handleRewind();
});

btnReset.addEventListener('click', () => {
  handleResetAll();
});

btnPlayAgain.addEventListener('click', () => {
  modalWin.classList.add('hidden');
  handleResetAll();
});

btnRetryLoop.addEventListener('click', () => {
  modalBusted.classList.add('hidden');
  soundFX.playRewind();
  engine.resetCurrentLoop();
});

btnRestartAll.addEventListener('click', () => {
  handleResetAll();
});

btnMute.addEventListener('click', () => {
  isAudioMuted = !isAudioMuted;
  muteLabel.textContent = isAudioMuted ? 'SFX: OFF' : 'SFX: ON';
  // Also pass to soundFX if needed
});

function updateHUD(): void {
  const state = engine.getState();

  loopBadge.textContent = `LOOP ${state.currentLoopIndex} / ${state.maxLoops}`;
  if (state.currentLoopIndex === state.maxLoops) {
    loopBadge.style.background = 'rgba(255, 68, 68, 0.2)';
    loopBadge.style.borderColor = '#ff4444';
    loopBadge.style.color = '#ff6666';
  } else {
    loopBadge.style.background = 'rgba(0, 229, 255, 0.15)';
    loopBadge.style.borderColor = '#00e5ff';
    loopBadge.style.color = '#00e5ff';
  }

  // Time progress bar
  const progress = Math.max(0, 1 - state.currentTick / state.maxTicks);
  timeBarFill.style.width = `${progress * 100}%`;
  const timeRemainingSeconds = Math.max(0, (state.maxTicks - state.currentTick) * 0.02).toFixed(1);
  timeStatus.textContent = `${timeRemainingSeconds}s`;

  if (progress < 0.25) {
    timeBarFill.style.background = '#ff4444';
    timeBarFill.style.boxShadow = '0 0 10px #ff4444';
  } else if (progress < 0.5) {
    timeBarFill.style.background = '#ffaa00';
    timeBarFill.style.boxShadow = '0 0 10px #ffaa00';
  } else {
    timeBarFill.style.background = '#00e5ff';
    timeBarFill.style.boxShadow = '0 0 10px #00e5ff';
  }

  // Objective status
  if (state.activePlayer.hasLoot) {
    objStatus.textContent = 'DIAMOND SECURED! ESCAPE TO EXTRACTION!';
    objStatus.style.color = '#00ffaa';
  } else {
    objStatus.textContent = 'INFILTRATE & GRAB DIAMOND';
    objStatus.style.color = '#38bdf8';
  }

  // Security status
  if (state.alarmTriggered) {
    secStatus.textContent = 'ALARM! LOCKDOWN!';
    secStatus.style.color = '#ff4444';
  } else {
    secStatus.textContent = 'CLEAR (STEALTH)';
    secStatus.style.color = '#00ffaa';
  }
}

function processSimEvents(events: SimEvent[]): void {
  for (const ev of events) {
    if (ev.type === 'SWITCH_DOWN') {
      soundFX.playSwitch();
    } else if (ev.type === 'DOOR_OPEN') {
      soundFX.playDoor(true);
    } else if (ev.type === 'DOOR_CLOSE') {
      soundFX.playDoor(false);
    } else if (ev.type === 'LOOT_TAKEN') {
      soundFX.playLootTaken();
    } else if (ev.type === 'ALARM') {
      soundFX.playAlarm();
      bustedReason.textContent = ev.reason || 'Security perimeter breached!';
      modalBusted.classList.remove('hidden');
    } else if (ev.type === 'WIN') {
      soundFX.playVictory();
      modalWin.classList.remove('hidden');
    }
  }
}

// Fixed timestep simulation loop (50Hz = 20ms)
const TICK_DURATION_MS = 20;
let lastTime = performance.now();
let accumulator = 0;
let lastEvents: SimEvent[] = [];

function gameLoop(currentTime: number): void {
  const dt = Math.min(100, currentTime - lastTime);
  lastTime = currentTime;

  if (isGameActive && engine.getState().status === 'RUNNING') {
    accumulator += dt;
    while (accumulator >= TICK_DURATION_MS) {
      const input = pollInput();
      lastEvents = engine.step(input);
      processSimEvents(lastEvents);
      accumulator -= TICK_DURATION_MS;

      // Play footstep occasionally on movement
      if ((input.dx !== 0 || input.dy !== 0) && engine.getState().currentTick % 12 === 0) {
        soundFX.playFootstep();
      }
    }
    updateHUD();
  }

  renderer.render(engine.getState(), engine.getLevel(), lastEvents);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
