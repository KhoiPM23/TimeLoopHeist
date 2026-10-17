import { soundFX } from './audio/soundFX';
import { GameRenderer } from './renderer/gameView';
import { TimeLoopEngine } from './simulation/engine';
import { PlayerInput, SimEvent } from './simulation/types';

// DOM Elements
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const stageBadge = document.getElementById('stageBadge') as HTMLElement;
const loopBadge = document.getElementById('loopBadge') as HTMLElement;
const timeBarFill = document.getElementById('timeBarFill') as HTMLElement;
const objStatus = document.getElementById('objStatus') as HTMLElement;
const secStatus = document.getElementById('secStatus') as HTMLElement;
const timeStatus = document.getElementById('timeStatus') as HTMLElement;

const btnPause = document.getElementById('btnPause') as HTMLButtonElement;
const pauseLabel = document.getElementById('pauseLabel') as HTMLElement;
const btnRewind = document.getElementById('btnRewind') as HTMLButtonElement;
const btnReset = document.getElementById('btnReset') as HTMLButtonElement;
const btnMute = document.getElementById('btnMute') as HTMLButtonElement;
const muteLabel = document.getElementById('muteLabel') as HTMLElement;
const btnMenu = document.getElementById('btnMenu') as HTMLButtonElement;

// Screens & Modals
const modalTitle = document.getElementById('modalTitle') as HTMLElement;
const btnStartGame = document.getElementById('btnStartGame') as HTMLButtonElement;
const modalStageClear = document.getElementById('modalStageClear') as HTMLElement;
const stageClearTitle = document.getElementById('stageClearTitle') as HTMLElement;
const stageClearStats = document.getElementById('stageClearStats') as HTMLElement;
const btnNextStage = document.getElementById('btnNextStage') as HTMLButtonElement;
const modalGrandClear = document.getElementById('modalGrandClear') as HTMLElement;
const btnReplayAll = document.getElementById('btnReplayAll') as HTMLButtonElement;
const modalBusted = document.getElementById('modalBusted') as HTMLElement;
const bustedReason = document.getElementById('bustedReason') as HTMLElement;
const btnRetryLoop = document.getElementById('btnRetryLoop') as HTMLButtonElement;
const btnRestartStage = document.getElementById('btnRestartStage') as HTMLButtonElement;

// Engine & Systems
const engine = new TimeLoopEngine(0); // Start at Stage 0 (Tutorial)
const renderer = new GameRenderer(canvas);

// Input state
const keys: Record<string, boolean> = {};
let isGameActive = false;

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  soundFX.ensureAudioActive();

  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    handleTogglePause();
    return;
  }
  if (e.key === 'm' || e.key === 'M') {
    handleToggleMute();
    return;
  }
  if (e.key === 'r' || e.key === 'R') {
    handleRewind();
    return;
  }
  if (e.key === 'f' || e.key === 'F') {
    handleResetStage();
    return;
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

function handleTogglePause(): void {
  if (!isGameActive) return;
  const state = engine.getState();
  const willPause = state.status !== 'PAUSED';
  engine.setPaused(willPause);
  pauseLabel.textContent = willPause ? 'RESUME' : 'PAUSE';
  btnPause.style.borderColor = willPause ? '#00ffaa' : '#293d5c';
}

function handleToggleMute(): void {
  const current = soundFX.isAudioMuted();
  const newMuted = soundFX.setMuted(!current);
  muteLabel.textContent = newMuted ? 'SFX: OFF' : 'SFX: ON';
}

function handleRewind(): void {
  if (!isGameActive || engine.getState().status === 'PAUSED') return;
  soundFX.playRewind();
  modalBusted.classList.add('hidden');
  const advanced = engine.rewindToNextLoop();
  if (!advanced) {
    engine.resetEntireRun();
  }
  updateHUD();
}

function handleResetStage(): void {
  soundFX.playRewind();
  engine.resetEntireRun();
  modalBusted.classList.add('hidden');
  modalStageClear.classList.add('hidden');
  modalGrandClear.classList.add('hidden');
  updateHUD();
}

// Button listeners
btnStartGame.addEventListener('click', () => {
  modalTitle.classList.add('hidden');
  isGameActive = true;
  soundFX.ensureAudioActive();
  updateHUD();
});

btnMenu.addEventListener('click', () => {
  modalTitle.classList.remove('hidden');
});

document.querySelectorAll('.btn-stage').forEach((btn) => {
  btn.addEventListener('click', () => {
    const stageIdx = parseInt(btn.getAttribute('data-stage') || '0', 10);
    engine.loadLevel(stageIdx);
    modalTitle.classList.add('hidden');
    isGameActive = true;
    updateHUD();
  });
});

btnPause.addEventListener('click', handleTogglePause);
btnRewind.addEventListener('click', handleRewind);
btnReset.addEventListener('click', handleResetStage);
btnMute.addEventListener('click', handleToggleMute);

btnRetryLoop.addEventListener('click', () => {
  modalBusted.classList.add('hidden');
  soundFX.playRewind();
  engine.resetCurrentLoop();
  updateHUD();
});

btnRestartStage.addEventListener('click', () => {
  handleResetStage();
});

btnNextStage.addEventListener('click', () => {
  modalStageClear.classList.add('hidden');
  const hasNext = engine.nextLevel();
  if (hasNext) {
    updateHUD();
  } else {
    modalGrandClear.classList.remove('hidden');
  }
});

btnReplayAll.addEventListener('click', () => {
  modalGrandClear.classList.add('hidden');
  engine.loadLevel(0);
  updateHUD();
});

function updateHUD(): void {
  const state = engine.getState();
  const level = engine.getLevel();

  stageBadge.textContent = level.name;
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
    objStatus.textContent = 'LOOT RETRIEVED! HEAD TO EXTRACTION ZONE!';
    objStatus.style.color = '#00ffaa';
  } else {
    objStatus.textContent = level.objectiveText;
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
      const currentIdx = engine.getLevelIndex();
      const total = engine.getTotalLevels();

      if (currentIdx === total - 1) {
        modalGrandClear.classList.remove('hidden');
      } else {
        stageClearTitle.textContent = `${engine.getLevel().name} COMPLETE`;
        stageClearStats.textContent = `Retrieved in Loop ${engine.getState().currentLoopIndex} of ${engine.getState().maxLoops}`;
        modalStageClear.classList.remove('hidden');
      }
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

      // Subtle footstep sound on movement
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
