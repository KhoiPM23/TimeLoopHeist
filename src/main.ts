import { soundFX } from './audio/soundFX';
import { GameRenderer3D } from './renderer/gameView3D';
import { TimeLoopEngine } from './simulation/engine';
import { ALL_LEVELS } from './simulation/levels';
import { PlayerInput, SimEvent, TerminalState } from './simulation/types';

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
const btnDossier = document.getElementById('btnDossier') as HTMLButtonElement;

// Screens & Modals
const modalTitle = document.getElementById('modalTitle') as HTMLElement;
const btnStartGame = document.getElementById('btnStartGame') as HTMLButtonElement;
const btnTitleHelp = document.getElementById('btnTitleHelp') as HTMLButtonElement | null;
const btnTitleDossier = document.getElementById('btnTitleDossier') as HTMLButtonElement | null;
const btnTitleSettings = document.getElementById('btnTitleSettings') as HTMLButtonElement | null;

const modalPause = document.getElementById('modalPause') as HTMLElement | null;
const btnResumeGame = document.getElementById('btnResumeGame') as HTMLButtonElement | null;
const btnPauseRestartStage = document.getElementById('btnPauseRestartStage') as HTMLButtonElement | null;
const btnPauseRewindLoop = document.getElementById('btnPauseRewindLoop') as HTMLButtonElement | null;
const btnPauseSettings = document.getElementById('btnPauseSettings') as HTMLButtonElement | null;
const btnPauseHelp = document.getElementById('btnPauseHelp') as HTMLButtonElement | null;
const btnPauseToMenu = document.getElementById('btnPauseToMenu') as HTMLButtonElement | null;

const modalStageClear = document.getElementById('modalStageClear') as HTMLElement;
const stageClearTitle = document.getElementById('stageClearTitle') as HTMLElement;
const stageClearStats = document.getElementById('stageClearStats') as HTMLElement;
const btnNextStage = document.getElementById('btnNextStage') as HTMLButtonElement;
const btnStageClearRetry = document.getElementById('btnStageClearRetry') as HTMLButtonElement | null;
const btnStageClearMenu = document.getElementById('btnStageClearMenu') as HTMLButtonElement | null;

const modalGrandClear = document.getElementById('modalGrandClear') as HTMLElement;
const btnReplayAll = document.getElementById('btnReplayAll') as HTMLButtonElement;
const btnGrandDossier = document.getElementById('btnGrandDossier') as HTMLButtonElement | null;
const btnGrandToMenu = document.getElementById('btnGrandToMenu') as HTMLButtonElement | null;
const grandCampaignStars = document.getElementById('grandCampaignStars') as HTMLElement | null;
const grandMasterRank = document.getElementById('grandMasterRank') as HTMLElement | null;
const grandTotalLoops = document.getElementById('grandTotalLoops') as HTMLElement | null;
const grandTotalTime = document.getElementById('grandTotalTime') as HTMLElement | null;
const grandTotalIntel = document.getElementById('grandTotalIntel') as HTMLElement | null;

const modalBusted = document.getElementById('modalBusted') as HTMLElement;
const bustedReason = document.getElementById('bustedReason') as HTMLElement;
const btnRetryLoop = document.getElementById('btnRetryLoop') as HTMLButtonElement;
const btnRestartStage = document.getElementById('btnRestartStage') as HTMLButtonElement;

// Classified Intel Dossier Modal & Elements
const modalIntelDossier = document.getElementById('modalIntelDossier') as HTMLElement;
const btnCloseDossier = document.getElementById('btnCloseDossier') as HTMLButtonElement;
const dossierList = document.getElementById('dossierList') as HTMLElement;
const dossierDetailTitle = document.getElementById('dossierDetailTitle') as HTMLElement;
const dossierDetailClassification = document.getElementById('dossierDetailClassification') as HTMLElement;
const dossierDetailDate = document.getElementById('dossierDetailDate') as HTMLElement;
const dossierDetailAuthor = document.getElementById('dossierDetailAuthor') as HTMLElement;
const dossierDetailBody = document.getElementById('dossierDetailBody') as HTMLElement;

// Tactical Radio Comms Card Elements
const thorneCommBox = document.getElementById('thorneCommBox') as HTMLElement;
const commSender = document.getElementById('commSender') as HTMLElement;
const commCallsign = document.getElementById('commCallsign') as HTMLElement;
const commText = document.getElementById('commText') as HTMLElement;
const standbyPrompt = document.getElementById('standbyPrompt') as HTMLElement;
const contextPrompt = document.getElementById('contextPrompt') as HTMLElement;
const contextKey = document.getElementById('contextKey') as HTMLElement;
const contextText = document.getElementById('contextText') as HTMLElement;

// Settings & Help Modals
const btnSettings = document.getElementById('btnSettings') as HTMLButtonElement | null;
const modalSettings = document.getElementById('modalSettings') as HTMLElement | null;
const btnCloseSettings = document.getElementById('btnCloseSettings') as HTMLButtonElement | null;
const sliderMasterVol = document.getElementById('sliderMasterVol') as HTMLInputElement | null;
const lblMasterVol = document.getElementById('lblMasterVol') as HTMLElement | null;
const sliderSFXVol = document.getElementById('sliderSFXVol') as HTMLInputElement | null;
const lblSFXVol = document.getElementById('lblSFXVol') as HTMLElement | null;
const sliderAmbientVol = document.getElementById('sliderAmbientVol') as HTMLInputElement | null;
const lblAmbientVol = document.getElementById('lblAmbientVol') as HTMLElement | null;
const btnToggleShake = document.getElementById('btnToggleShake') as HTMLButtonElement | null;
const btnToggleFullscreen = document.getElementById('btnToggleFullscreen') as HTMLButtonElement | null;

const btnHelp = document.getElementById('btnHelp') as HTMLButtonElement | null;
const modalHelp = document.getElementById('modalHelp') as HTMLElement | null;
const btnCloseHelp = document.getElementById('btnCloseHelp') as HTMLButtonElement | null;

// Debrief Elements
const debriefLoops = document.getElementById('debriefLoops') as HTMLElement | null;
const debriefTime = document.getElementById('debriefTime') as HTMLElement | null;
const debriefIntel = document.getElementById('debriefIntel') as HTMLElement | null;
const debriefStealth = document.getElementById('debriefStealth') as HTMLElement | null;
const debriefStars = document.getElementById('debriefStars') as HTMLElement | null;

// Engine & Systems
const engine = new TimeLoopEngine(0); // Start at Stage 0 (Tutorial)
const renderer = new GameRenderer3D(canvas);

// Input state
const keys: Record<string, boolean> = {};
let isGameActive = false;
let isStandby = true;
let selectedTerminalId = 'term-0-1';
let commTimer: ReturnType<typeof setTimeout> | null = null;

function closeAllModals(): void {
  modalTitle.classList.add('hidden');
  modalStageClear.classList.add('hidden');
  modalGrandClear.classList.add('hidden');
  modalPause?.classList.add('hidden');
  modalBusted.classList.add('hidden');
  modalIntelDossier.classList.add('hidden');
  modalSettings?.classList.add('hidden');
  modalHelp?.classList.add('hidden');
}

interface StageRecord {
  stars: number;
  time: number;
  loops: number;
}

function getStoredStageRecords(): Record<number, StageRecord> {
  try {
    const raw = localStorage.getItem('timeloop_stage_records');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStageRecord(stageIdx: number, stars: number, time: number, loops: number): void {
  try {
    const records = getStoredStageRecords();
    const existing = records[stageIdx];
    if (!existing || stars > existing.stars || (stars === existing.stars && time < existing.time)) {
      records[stageIdx] = { stars, time, loops };
      localStorage.setItem('timeloop_stage_records', JSON.stringify(records));
    }
  } catch {}
}

function updateStageSelectBadges(): void {
  const records = getStoredStageRecords();
  const stageButtons = document.querySelectorAll<HTMLButtonElement>('.btn-stage');
  const baseNames = [
    'Stage 0: Tutorial',
    'Stage 1: Laser Grid',
    'Stage 2: Quantum Sanctum',
    'Stage 3: Obsidian Vault',
    'Stage 4: Quantum Paradox'
  ];
  stageButtons.forEach((btn) => {
    const stageIdx = parseInt(btn.dataset.stage || btn.getAttribute('data-stage') || '0', 10);
    const rec = records[stageIdx];
    const baseName = baseNames[stageIdx] || `Stage ${stageIdx}`;
    if (rec && rec.stars > 0) {
      const starsStr = '★'.repeat(rec.stars);
      btn.innerHTML = `${baseName} <span style="color: #ffd700; margin-left: 6px;">${starsStr}</span>`;
    } else {
      btn.textContent = baseName;
    }
  });

  try {
    const lastStage = localStorage.getItem('timeloop_last_stage');
    const stageToResume = lastStage ? parseInt(lastStage, 10) : 0;
    if (btnStartGame && stageToResume > 0 && stageToResume < ALL_LEVELS.length) {
      btnStartGame.textContent = `CONTINUE MISSION [STAGE ${stageToResume}]`;
    } else if (btnStartGame) {
      btnStartGame.textContent = `START MISSION [STAGE 0]`;
    }
  } catch {}
}

function updateGrandCampaignModal(): void {
  const records = getStoredStageRecords();
  let totalStars = 0;
  let totalLoops = 0;
  let totalTime = 0;

  for (let i = 0; i < ALL_LEVELS.length; i++) {
    const rec = records[i];
    if (rec) {
      totalStars += rec.stars;
      totalLoops += rec.loops;
      totalTime += rec.time;
    }
  }

  const maxStars = ALL_LEVELS.length * 3;
  if (grandCampaignStars) {
    grandCampaignStars.textContent = `${totalStars} / ${maxStars} ★★★`;
  }
  if (grandTotalLoops) {
    grandTotalLoops.textContent = `${totalLoops} Loops`;
  }
  if (grandTotalTime) {
    grandTotalTime.textContent = `${totalTime.toFixed(1)}s`;
  }
  if (grandTotalIntel) {
    const unlockedCount = engine.getUnlockedTerminalIds().length;
    grandTotalIntel.textContent = `${unlockedCount} / 5 Decrypted`;
  }
  if (grandMasterRank) {
    if (totalStars === maxStars) {
      grandMasterRank.textContent = 'LEGENDARY GHOST OPERATIVE';
      grandMasterRank.style.color = '#00ffaa';
    } else if (totalStars >= 11) {
      grandMasterRank.textContent = 'MASTER TEMPORAL INFILTRATOR';
      grandMasterRank.style.color = '#00e5ff';
    } else {
      grandMasterRank.textContent = 'CHRONO-AGENT CODENAME: OUROBOROS';
      grandMasterRank.style.color = '#ffd700';
    }
  }
}

function startGame(): void {
  soundFX.playUIClick();
  let targetStage = 0;
  try {
    const lastStageStr = localStorage.getItem('timeloop_last_stage');
    if (lastStageStr) {
      const parsed = parseInt(lastStageStr, 10);
      if (parsed >= 0 && parsed < ALL_LEVELS.length) {
        targetStage = parsed;
      }
    }
  } catch {}
  loadStage(targetStage);
}

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  soundFX.ensureAudioActive();

  // If title screen is open, Space / Enter / WASD starts game; H, I, O toggle modals
  if (!modalTitle.classList.contains('hidden')) {
    if (k === 'h') {
      e.preventDefault();
      toggleHelpModal();
      return;
    }
    if (k === 'i') {
      e.preventDefault();
      toggleDossierModal();
      return;
    }
    if (k === 'o') {
      e.preventDefault();
      toggleSettingsModal();
      return;
    }
    if (e.key === 'Enter' || e.code === 'Space' || ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      e.preventDefault();
      startGame();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        isStandby = false;
        updateHUD();
      }
      return;
    }
  }

  // If dossier modal is open, allow closing with Escape or I
  if (!modalIntelDossier.classList.contains('hidden')) {
    if (e.key === 'Escape' || k === 'i') {
      e.preventDefault();
      toggleDossierModal();
      return;
    }
  }

  // If busted modal is visible, allow instant keyboard recovery
  if (!modalBusted.classList.contains('hidden')) {
    if (k === 'r' || e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      handleRewind();
      return;
    }
    if (k === 'f') {
      e.preventDefault();
      handleResetStage();
      return;
    }
  }

  // If Stage Clear modal is visible: Space/Enter advances, F retries, M returns to stage select
  if (!modalStageClear.classList.contains('hidden')) {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      modalStageClear.classList.add('hidden');
      const hasNext = engine.nextLevel();
      if (hasNext) {
        isStandby = true;
        soundFX.startStealthAtmosphere();
        updateHUD();
        triggerThorneComm('START');
        restoreFocus();
      } else {
        updateGrandCampaignModal();
        modalGrandClear.classList.remove('hidden');
      }
      return;
    }
    if (k === 'f') {
      e.preventDefault();
      modalStageClear.classList.add('hidden');
      handleResetStage();
      return;
    }
    if (k === 'm') {
      e.preventDefault();
      closeAllModals();
      modalTitle.classList.remove('hidden');
      updateStageSelectBadges();
      return;
    }
  }

  // If Grand Clear modal is visible: Space/Enter replays all, I views dossier, M returns to menu
  if (!modalGrandClear.classList.contains('hidden')) {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      modalGrandClear.classList.add('hidden');
      loadStage(0);
      return;
    }
    if (k === 'i') {
      e.preventDefault();
      toggleDossierModal();
      return;
    }
    if (k === 'm') {
      e.preventDefault();
      closeAllModals();
      modalTitle.classList.remove('hidden');
      updateStageSelectBadges();
      return;
    }
  }

  // If game is paused, handle pause modal shortcuts
  if (engine.getState().status === 'PAUSED') {
    if (k === 'p' || e.key === 'Escape') {
      e.preventDefault();
      handleTogglePause();
      return;
    }
    if (k === 'f') {
      e.preventDefault();
      modalPause?.classList.add('hidden');
      handleResetStage();
      return;
    }
    if (k === 'r') {
      e.preventDefault();
      modalPause?.classList.add('hidden');
      handleRewind();
      return;
    }
    if (k === 'o') {
      e.preventDefault();
      toggleSettingsModal();
      return;
    }
    if (k === 'h') {
      e.preventDefault();
      toggleHelpModal();
      return;
    }
    if (k === 'm') {
      e.preventDefault();
      closeAllModals();
      modalTitle.classList.remove('hidden');
      updateStageSelectBadges();
      return;
    }
    return;
  }

  if (k === 'p' || e.key === 'Escape') {
    if (!modalSettings?.classList.contains('hidden')) {
      toggleSettingsModal();
      return;
    }
    if (!modalHelp?.classList.contains('hidden')) {
      toggleHelpModal();
      return;
    }
    if (!modalIntelDossier.classList.contains('hidden')) {
      toggleDossierModal();
      return;
    }
    handleTogglePause();
    return;
  }
  if (k === 'i') {
    e.preventDefault();
    toggleDossierModal();
    return;
  }
  if (k === 'o') {
    e.preventDefault();
    toggleSettingsModal();
    return;
  }
  if (k === 'h') {
    e.preventDefault();
    toggleHelpModal();
    return;
  }
  if (k === 'm') {
    handleToggleMute();
    return;
  }
  if (k === 'r') {
    handleRewind();
    return;
  }
  if (k === 'f') {
    handleResetStage();
    return;
  }
  // Quick stage jump [0]..[4]
  if (e.key >= '0' && e.key <= '4') {
    const stageIdx = parseInt(e.key, 10);
    e.preventDefault();
    loadStage(stageIdx);
    return;
  }
});

function restoreFocus(): void {
  try {
    canvas.focus();
    window.focus();
  } catch {
    // Ignore
  }
}

function triggerThorneComm(trigger: 'START' | 'REWIND' | 'ALARM' | 'LOOT' | 'EXTRACT' | 'HACK'): void {
  const level = engine.getLevel();
  if (!level.handlerComms) return;
  const comm = level.handlerComms.find(c => c.trigger === trigger);
  if (!comm) return;

  commSender.textContent = comm.sender.toUpperCase();
  commCallsign.textContent = `// ${comm.callsign}`;
  commText.textContent = comm.text;

  thorneCommBox.classList.remove('comm-hidden');
  soundFX.playRadioChirp();

  if (commTimer) clearTimeout(commTimer);
  commTimer = setTimeout(() => {
    thorneCommBox.classList.add('comm-hidden');
  }, 6500);
}

function toggleDossierModal(): void {
  const isHidden = modalIntelDossier.classList.contains('hidden');
  if (isHidden) {
    updateDossierModal();
    modalIntelDossier.classList.remove('hidden');
    soundFX.playRadioChirp();
  } else {
    modalIntelDossier.classList.add('hidden');
    restoreFocus();
  }
}

function updateDossierModal(): void {
  dossierList.innerHTML = '';
  const unlockedIds = new Set(engine.getUnlockedTerminalIds());
  let hasRenderedDetail = false;

  ALL_LEVELS.forEach(lvl => {
    if (!lvl.terminals || lvl.terminals.length === 0) return;

    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size: 9px; color: #00e5ff; font-weight: 700; margin-top: 8px; letter-spacing: 1px;';
    hdr.textContent = `STAGE ${lvl.stageNumber}: ${lvl.facilityName || lvl.name}`;
    dossierList.appendChild(hdr);

    lvl.terminals.forEach(term => {
      const isUnlocked = unlockedIds.has(term.id);
      const isSelected = term.id === selectedTerminalId;

      const item = document.createElement('div');
      item.className = `dossier-item ${isUnlocked ? '' : 'locked'} ${isSelected ? 'active' : ''}`;
      item.innerHTML = `
        <div style="font-weight: 600; color: ${isUnlocked ? '#00e5ff' : '#64748b'}; font-size: 10px;">
          ${isUnlocked ? '● [DECRYPTED]' : '○ [LOCKED]'} ${isUnlocked ? term.title : 'CLASSIFIED LOG'}
        </div>
        <div style="font-size: 8px; color: #475569; margin-top: 2px;">
          ${isUnlocked ? term.author : 'Touch terminal in stage to decrypt'}
        </div>
      `;

      item.addEventListener('click', () => {
        selectedTerminalId = term.id;
        renderDossierDetail(term, isUnlocked);
        updateDossierModal();
      });

      dossierList.appendChild(item);

      if (isSelected || !hasRenderedDetail) {
        renderDossierDetail(term, isUnlocked);
        hasRenderedDetail = true;
      }
    });
  });
}

function renderDossierDetail(term: TerminalState, isUnlocked: boolean): void {
  if (isUnlocked) {
    dossierDetailClassification.textContent = term.classification;
    dossierDetailClassification.className = 'classification-badge unlocked';
    dossierDetailDate.textContent = `DATE: ${term.date}`;
    dossierDetailTitle.textContent = term.title;
    dossierDetailAuthor.textContent = `AUTHOR: ${term.author}`;
    dossierDetailBody.textContent = term.loreSnippet;
  } else {
    dossierDetailClassification.textContent = 'RESTRICTED // ENCRYPTED';
    dossierDetailClassification.className = 'classification-badge';
    dossierDetailDate.textContent = 'DATE: UNKNOWN';
    dossierDetailTitle.textContent = 'CLASSIFIED ARCHIVE FILE [ENCRYPTED]';
    dossierDetailAuthor.textContent = 'AUTHOR: REDACTED';
    dossierDetailBody.textContent = 'This data packet has not yet been decrypted.\n\nTo access this classified intelligence file, locate and infiltrate the computer terminal workstation inside this facility sector during your heist run.';
  }
}

function loadStage(stageIdx: number): void {
  engine.loadLevel(stageIdx);
  try {
    localStorage.setItem('timeloop_last_stage', String(stageIdx));
  } catch {}
  closeAllModals();
  isGameActive = true;
  engine.setPaused(false);
  pauseLabel.textContent = 'PAUSE';
  btnPause.style.borderColor = '#293d5c';
  isStandby = true;
  soundFX.startStealthAtmosphere();
  updateHUD();
  triggerThorneComm('START');
  restoreFocus();
}

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
  if (isStandby && (dx !== 0 || dy !== 0 || interact)) {
    isStandby = false;
    updateHUD();
  }
  return { dx, dy, interact };
}

function handleTogglePause(): void {
  if (!isGameActive) return;
  const state = engine.getState();
  const willPause = state.status !== 'PAUSED';
  engine.setPaused(willPause);
  pauseLabel.textContent = willPause ? 'RESUME' : 'PAUSE';
  btnPause.style.borderColor = willPause ? '#00ffaa' : '#293d5c';
  if (willPause) {
    soundFX.stopStealthAtmosphere();
    modalPause?.classList.remove('hidden');
  } else {
    modalPause?.classList.add('hidden');
    soundFX.startStealthAtmosphere();
    restoreFocus();
  }
}

function handleToggleMute(): void {
  const current = soundFX.isAudioMuted();
  const newMuted = soundFX.setMuted(!current);
  muteLabel.textContent = newMuted ? 'SFX: OFF' : 'SFX: ON';
  if (newMuted) {
    soundFX.stopStealthAtmosphere();
  } else if (isGameActive) {
    soundFX.startStealthAtmosphere();
  }
}

function handleRewind(): void {
  if (!isGameActive || engine.getState().status === 'PAUSED') return;
  soundFX.playRewind();
  renderer.triggerRewindGlitch();
  modalBusted.classList.add('hidden');
  const advanced = engine.rewindToNextLoop();
  if (!advanced) {
    engine.resetEntireRun();
  }
  isStandby = true;
  soundFX.startStealthAtmosphere();
  soundFX.playEchoSpawn();
  updateHUD();
  triggerThorneComm('REWIND');
  restoreFocus();
}

function handleResetStage(): void {
  soundFX.playRewind();
  engine.resetEntireRun();
  closeAllModals();
  engine.setPaused(false);
  pauseLabel.textContent = 'PAUSE';
  btnPause.style.borderColor = '#293d5c';
  isStandby = true;
  soundFX.startStealthAtmosphere();
  updateHUD();
  triggerThorneComm('START');
  restoreFocus();
}

// Button listeners
btnStartGame.addEventListener('click', startGame);

btnMenu.addEventListener('click', () => {
  soundFX.playUIClick();
  closeAllModals();
  modalTitle.classList.remove('hidden');
  updateStageSelectBadges();
  engine.setPaused(true);
  soundFX.stopStealthAtmosphere();
});

btnDossier.addEventListener('click', toggleDossierModal);
btnCloseDossier.addEventListener('click', toggleDossierModal);

btnSettings?.addEventListener('click', toggleSettingsModal);
btnCloseSettings?.addEventListener('click', toggleSettingsModal);

btnHelp?.addEventListener('click', toggleHelpModal);
btnCloseHelp?.addEventListener('click', toggleHelpModal);

sliderMasterVol?.addEventListener('input', () => {
  const val = parseFloat(sliderMasterVol.value);
  soundFX.setMasterVolume(val);
  if (lblMasterVol) lblMasterVol.textContent = `${Math.round(val * 100)}%`;
});

sliderSFXVol?.addEventListener('input', () => {
  const val = parseFloat(sliderSFXVol.value);
  soundFX.setSFXVolume(val);
  if (lblSFXVol) lblSFXVol.textContent = `${Math.round(val * 100)}%`;
});

sliderAmbientVol?.addEventListener('input', () => {
  const val = parseFloat(sliderAmbientVol.value);
  soundFX.setAmbientVolume(val);
  if (lblAmbientVol) lblAmbientVol.textContent = `${Math.round(val * 100)}%`;
});

btnToggleShake?.addEventListener('click', () => {
  const cur = renderer.isScreenShakeActive();
  const next = renderer.setScreenShakeEnabled(!cur);
  btnToggleShake.textContent = next ? 'ENABLED' : 'DISABLED';
  btnToggleShake.style.borderColor = next ? '#00ffaa' : '#64748b';
  btnToggleShake.style.color = next ? '#00ffaa' : '#64748b';
});

btnToggleFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    btnToggleFullscreen.textContent = 'EXIT FULLSCREEN [F11]';
  } else {
    document.exitFullscreen().catch(() => {});
    btnToggleFullscreen.textContent = 'ENTER FULLSCREEN [F11]';
  }
});

function toggleSettingsModal(): void {
  if (!modalSettings) return;
  const isHidden = modalSettings.classList.contains('hidden');
  if (isHidden) {
    modalSettings.classList.remove('hidden');
    soundFX.playRadioChirp();
  } else {
    modalSettings.classList.add('hidden');
    restoreFocus();
  }
}

function toggleHelpModal(): void {
  if (!modalHelp) return;
  const isHidden = modalHelp.classList.contains('hidden');
  if (isHidden) {
    modalHelp.classList.remove('hidden');
    soundFX.playRadioChirp();
  } else {
    modalHelp.classList.add('hidden');
    restoreFocus();
  }
}

document.querySelectorAll('.btn-stage').forEach((btn) => {
  btn.addEventListener('click', () => {
    soundFX.playUIClick();
    const stageIdx = parseInt(btn.getAttribute('data-stage') || '0', 10);
    loadStage(stageIdx);
  });
});

btnPause.addEventListener('click', () => {
  soundFX.playUIClick();
  handleTogglePause();
});
btnRewind.addEventListener('click', () => {
  soundFX.playUIClick();
  handleRewind();
});
btnReset.addEventListener('click', () => {
  soundFX.playUIClick();
  handleResetStage();
});
btnMute.addEventListener('click', () => {
  soundFX.playUIClick();
  handleToggleMute();
});

btnRetryLoop.addEventListener('click', () => {
  soundFX.playUIClick();
  modalBusted.classList.add('hidden');
  soundFX.playRewind();
  engine.resetCurrentLoop();
  isStandby = true;
  soundFX.startStealthAtmosphere();
  updateHUD();
  restoreFocus();
});

btnRestartStage.addEventListener('click', () => {
  soundFX.playUIClick();
  handleResetStage();
});

btnNextStage.addEventListener('click', () => {
  soundFX.playUIClick();
  modalStageClear.classList.add('hidden');
  const hasNext = engine.nextLevel();
  if (hasNext) {
    isStandby = true;
    soundFX.startStealthAtmosphere();
    updateHUD();
    triggerThorneComm('START');
    restoreFocus();
  } else {
    updateGrandCampaignModal();
    modalGrandClear.classList.remove('hidden');
  }
});

btnStageClearRetry?.addEventListener('click', () => {
  soundFX.playUIClick();
  modalStageClear.classList.add('hidden');
  handleResetStage();
});

btnStageClearMenu?.addEventListener('click', () => {
  soundFX.playUIClick();
  closeAllModals();
  modalTitle.classList.remove('hidden');
  updateStageSelectBadges();
});

btnResumeGame?.addEventListener('click', () => {
  soundFX.playUIClick();
  handleTogglePause();
});

btnPauseRestartStage?.addEventListener('click', () => {
  soundFX.playUIClick();
  modalPause?.classList.add('hidden');
  handleResetStage();
});

btnPauseRewindLoop?.addEventListener('click', () => {
  soundFX.playUIClick();
  modalPause?.classList.add('hidden');
  handleRewind();
});

btnPauseSettings?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleSettingsModal();
});

btnPauseHelp?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleHelpModal();
});

btnPauseToMenu?.addEventListener('click', () => {
  soundFX.playUIClick();
  closeAllModals();
  modalTitle.classList.remove('hidden');
  updateStageSelectBadges();
});

btnTitleHelp?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleHelpModal();
});

btnTitleDossier?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleDossierModal();
});

btnTitleSettings?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleSettingsModal();
});

btnReplayAll.addEventListener('click', () => {
  soundFX.playUIClick();
  modalGrandClear.classList.add('hidden');
  loadStage(0);
});

btnGrandDossier?.addEventListener('click', () => {
  soundFX.playUIClick();
  toggleDossierModal();
});

btnGrandToMenu?.addEventListener('click', () => {
  soundFX.playUIClick();
  closeAllModals();
  modalTitle.classList.remove('hidden');
  updateStageSelectBadges();
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
  } else if (state.activeHint) {
    objStatus.textContent = state.activeHint;
    objStatus.style.color = '#38bdf8';
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

  // Dynamic tension modulation on background synth drone
  const timeTension = Math.max(0, 1 - (state.maxTicks - state.currentTick) / (state.maxTicks * 0.4));
  const alarmTension = state.alarmTriggered ? 1.0 : 0.0;
  const combinedTension = Math.max(timeTension, alarmTension);
  soundFX.setAtmosphereTension(combinedTension);

  // Standby prompt
  if (standbyPrompt) {
    if (isStandby) {
      standbyPrompt.classList.remove('hidden');
    } else {
      standbyPrompt.classList.add('hidden');
    }
  }

  // Contextual Interaction Prompts
  if (contextPrompt && contextKey && contextText) {
    let promptShown = false;

    // 1. Proximity to Unhacked Terminals
    if (state.terminals) {
      for (const term of state.terminals) {
        if (!term.isHacked) {
          const dist = Math.hypot(state.activePlayer.x - term.x, state.activePlayer.y - term.y);
          if (dist <= state.activePlayer.radius + term.radius + 24) {
            contextKey.textContent = '[E] / APPROACH';
            contextText.textContent = `HACK TERMINAL // ${term.title}`;
            contextPrompt.classList.remove('hidden');
            promptShown = true;
            break;
          }
        }
      }
    }

    // 2. Proximity to Loot Core
    if (!promptShown && !state.activePlayer.hasLoot && !state.loot.isCollected) {
      const dist = Math.hypot(state.activePlayer.x - state.loot.x, state.activePlayer.y - state.loot.y);
      if (dist <= state.activePlayer.radius + state.loot.radius + 28) {
        contextKey.textContent = '[STEP]';
        contextText.textContent = 'SECURE DATA CORE';
        contextPrompt.classList.remove('hidden');
        promptShown = true;
      }
    }

    // 3. Proximity to Extraction Zone
    if (!promptShown && state.activePlayer.hasLoot) {
      const ex = level.extraction;
      const dist = Math.hypot(
        state.activePlayer.x - (ex.x + ex.width / 2),
        state.activePlayer.y - (ex.y + ex.height / 2)
      );
      if (dist <= ex.width + 30) {
        contextKey.textContent = '[EXTRACT]';
        contextText.textContent = 'ENTER EVACUATION ZONE';
        contextPrompt.classList.remove('hidden');
        promptShown = true;
      }
    }

    if (!promptShown) {
      contextPrompt.classList.add('hidden');
    }
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
      triggerThorneComm('LOOT');
    } else if (ev.type === 'TERMINAL_HACKED') {
      soundFX.playHackSuccess();
      triggerThorneComm('HACK');
    } else if (ev.type === 'ALARM') {
      soundFX.playAlarm();
      soundFX.stopStealthAtmosphere();
      bustedReason.textContent = ev.reason || 'Security perimeter breached!';
      modalBusted.classList.remove('hidden');
      triggerThorneComm('ALARM');
    } else if (ev.type === 'WIN') {
      soundFX.playVictory();
      soundFX.stopStealthAtmosphere();
      triggerThorneComm('EXTRACT');
      const currentIdx = engine.getLevelIndex();
      const total = engine.getTotalLevels();
      const state = engine.getState();

      // Populate detailed debrief
      if (debriefLoops) debriefLoops.textContent = `${state.currentLoopIndex} / ${state.maxLoops} LOOPS`;
      if (debriefTime) debriefTime.textContent = `${(state.currentTick * 0.02).toFixed(1)}s`;
      
      const unlockedCount = engine.getUnlockedTerminalIds().length;
      if (debriefIntel) debriefIntel.textContent = `${unlockedCount} LOGS RECOVERED`;

      const isGhost = !state.alarmTriggered && state.currentLoopIndex <= 2;
      const isTactical = !state.alarmTriggered;

      if (debriefStealth) {
        if (isGhost) {
          debriefStealth.textContent = 'PERFECT GHOST (STEALTH)';
          debriefStealth.style.color = '#00ffaa';
        } else if (isTactical) {
          debriefStealth.textContent = 'TACTICAL INFILTRATOR';
          debriefStealth.style.color = '#00e5ff';
        } else {
          debriefStealth.textContent = 'ALARM COMPROMISED';
          debriefStealth.style.color = '#ff4444';
        }
      }

      if (debriefStars) {
        if (isGhost) {
          debriefStars.textContent = '★★★';
          debriefStars.style.color = '#ffd700';
        } else if (isTactical) {
          debriefStars.textContent = '★★☆';
          debriefStars.style.color = '#00e5ff';
        } else {
          debriefStars.textContent = '★☆☆';
          debriefStars.style.color = '#64748b';
        }
      }

      const starsEarned = isGhost ? 3 : isTactical ? 2 : 1;
      const elapsedSec = state.currentTick * 0.02;
      saveStageRecord(currentIdx, starsEarned, elapsedSec, state.currentLoopIndex);
      try {
        localStorage.setItem('timeloop_last_stage', String(Math.min(total - 1, currentIdx + 1)));
      } catch {}
      updateStageSelectBadges();

      if (currentIdx === total - 1) {
        updateGrandCampaignModal();
        modalGrandClear.classList.remove('hidden');
      } else {
        stageClearTitle.textContent = `${engine.getLevel().name} COMPLETE`;
        stageClearStats.textContent = `Retrieved in Loop ${state.currentLoopIndex} of ${state.maxLoops}`;
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

  const state = engine.getState();
  (state as { isStandby?: boolean }).isStandby = isStandby;

  if (isGameActive && state.status === 'RUNNING') {
    // ALWAYS poll input to break standby as soon as a movement key is pressed
    const liveInput = pollInput();

    if (!isStandby) {
      accumulator += dt;
      while (accumulator >= TICK_DURATION_MS) {
        lastEvents = engine.step(liveInput);
        processSimEvents(lastEvents);
        accumulator -= TICK_DURATION_MS;

        // Subtle footstep sound on movement
        if ((liveInput.dx !== 0 || liveInput.dy !== 0) && engine.getState().currentTick % 12 === 0) {
          soundFX.playFootstep();
        }
      }
      updateHUD();
    }
  }

  renderer.render(engine.getState(), engine.getLevel(), lastEvents);
  requestAnimationFrame(gameLoop);
}

// Initialize stage badges and UI state
updateStageSelectBadges();
requestAnimationFrame(gameLoop);
