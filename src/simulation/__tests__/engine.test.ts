import { describe, expect, it } from 'vitest';
import { TimeLoopEngine } from '../engine';
import { PlayerInput } from '../types';

describe('TimeLoopHeist Multi-Stage Deterministic Engine', () => {
  it('should initialize Stage 0 (Tutorial) correctly', () => {
    const engine = new TimeLoopEngine(0);
    const state = engine.getState();
    const level = engine.getLevel();

    expect(level.stageNumber).toBe(0);
    expect(state.status).toBe('RUNNING');
    expect(state.currentTick).toBe(0);
    expect(state.currentLoopIndex).toBe(1);
    expect(state.maxLoops).toBe(2);
    expect(state.ghostPlayers.length).toBe(0);
    expect(state.activeHint).toBeDefined();
  });

  it('should pause and resume simulation cleanly', () => {
    const engine = new TimeLoopEngine(0);
    engine.setPaused(true);
    expect(engine.getState().status).toBe('PAUSED');

    // Stepping while paused should not advance ticks
    engine.step({ dx: 1, dy: 0, interact: false });
    expect(engine.getState().currentTick).toBe(0);

    engine.setPaused(false);
    expect(engine.getState().status).toBe('RUNNING');
    engine.step({ dx: 1, dy: 0, interact: false });
    expect(engine.getState().currentTick).toBe(1);
  });

  it('should execute full cooperative flow in Stage 0 Tutorial with true movement replay', () => {
    const engine = new TimeLoopEngine(0);
    const tutSwitch = engine.getLevel().switches[0]; // Switch at (350, 120)

    // Loop 1: Walk from spawn (100, 300) to switch at (350, 120)
    // 78 ticks right
    for (let i = 0; i < 78; i++) {
      engine.step({ dx: 1, dy: 0, interact: false });
    }
    // 56 ticks up
    for (let i = 0; i < 56; i++) {
      engine.step({ dx: 0, dy: -1, interact: false });
    }

    // Now player should be on switch
    const distToSwitch = Math.hypot(engine.getState().activePlayer.x - tutSwitch.x, engine.getState().activePlayer.y - tutSwitch.y);
    expect(distToSwitch).toBeLessThanOrEqual(tutSwitch.radius);
    expect(engine.getState().switches[0].isPressed).toBe(true);
    expect(engine.getState().doors[0].isOpen).toBe(true);

    // Stand on switch for 30 ticks
    for (let i = 0; i < 30; i++) {
      engine.step({ dx: 0, dy: 0, interact: false });
    }

    // Rewind to Loop 2
    const advanced = engine.rewindToNextLoop();
    expect(advanced).toBe(true);
    expect(engine.getState().currentLoopIndex).toBe(2);
    expect(engine.getState().ghostPlayers.length).toBe(1);

    // Step Loop 2 for 134 ticks so Ghost walks to switch
    for (let i = 0; i < 134; i++) {
      engine.step({ dx: 0, dy: 0, interact: false });
    }

    // Now ghost has arrived at the switch and is standing on it!
    const stateLoop2 = engine.getState();
    expect(stateLoop2.switches[0].isPressed).toBe(true);
    expect(stateLoop2.doors[0].isOpen).toBe(true);

    // Active player moves right through the open door towards keycard at (720, 300)
    // From spawn (100, 300) straight right: (720 - 100) / 3.2 = ~194 ticks
    for (let i = 0; i < 200; i++) {
      engine.step({ dx: 1, dy: 0, interact: true });
    }

    expect(engine.getState().activePlayer.hasLoot).toBe(true);

    // Now sprint back left to extraction zone at (40, 250)
    for (let i = 0; i < 220; i++) {
      engine.step({ dx: -1, dy: 0, interact: false });
    }

    expect(engine.getState().status).toBe('WON');
  });

  it('should trigger alarm if spotted by guard in Stage 1', () => {
    const engine = new TimeLoopEngine(1); // Stage 1 has a guard at (280, 300)
    const guard = engine.getState().guards[0];

    // Place active player in guard's field of view
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.x = guard.x + 50;
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.y = guard.y;

    const events = engine.step({ dx: 0, dy: 0, interact: false });

    expect(engine.getState().status).toBe('BUSTED');
    expect(engine.getState().alarmTriggered).toBe(true);
    expect(events.some(e => e.type === 'ALARM')).toBe(true);
  });

  it('should support up to 3 cooperating clones in Stage 2', () => {
    const engine = new TimeLoopEngine(2); // Stage 2 allows 4 loops (3 clones)
    expect(engine.getLevel().maxLoops).toBe(4);

    // Loop 1
    engine.step({ dx: 1, dy: 0, interact: false });
    engine.rewindToNextLoop();
    expect(engine.getState().ghostPlayers.length).toBe(1);

    // Loop 2
    engine.step({ dx: 0, dy: 1, interact: false });
    engine.rewindToNextLoop();
    expect(engine.getState().ghostPlayers.length).toBe(2);

    // Loop 3
    engine.step({ dx: -1, dy: 0, interact: false });
    engine.rewindToNextLoop();
    expect(engine.getState().ghostPlayers.length).toBe(3);
    expect(engine.getState().currentLoopIndex).toBe(4);
  });

  it('should cleanly reset entire run without orphaned state', () => {
    const engine = new TimeLoopEngine(1);
    engine.step({ dx: 1, dy: 0, interact: false });
    engine.rewindToNextLoop();
    expect(engine.getState().ghostPlayers.length).toBe(1);

    engine.resetEntireRun();
    const resetState = engine.getState();
    expect(resetState.currentLoopIndex).toBe(1);
    expect(resetState.ghostPlayers.length).toBe(0);
    expect(resetState.currentTick).toBe(0);
    expect(resetState.status).toBe('RUNNING');
    expect(resetState.alarmTriggered).toBe(false);
  });

  it('should guarantee deterministic input replay reproduction', () => {
    const engine = new TimeLoopEngine(0);
    const inputs: PlayerInput[] = [
      { dx: 1, dy: 0, interact: false },
      { dx: 1, dy: 1, interact: false },
      { dx: 0, dy: -1, interact: false },
      { dx: -1, dy: 0, interact: false }
    ];

    for (let i = 0; i < 40; i++) {
      engine.step(inputs[i % inputs.length]);
    }
    const finalPosX = engine.getState().activePlayer.x;
    const finalPosY = engine.getState().activePlayer.y;

    // Advance to Loop 2
    engine.rewindToNextLoop();

    // Replay 40 ticks
    for (let i = 0; i < 40; i++) {
      engine.step({ dx: 0, dy: 0, interact: false });
    }

    // Ghost position at tick 40 must exactly match Loop 1 player position at tick 40
    expect(engine.getState().ghostPlayers[0].x).toBe(finalPosX);
    expect(engine.getState().ghostPlayers[0].y).toBe(finalPosY);
  });

  it('should initialize and run Stage 3 The Obsidian Vault with full multi-loop support', () => {
    const engine = new TimeLoopEngine(3);
    const level = engine.getLevel();
    const state = engine.getState();

    expect(level.id).toBe('stage-3');
    expect(level.stageNumber).toBe(3);
    expect(level.maxLoops).toBe(4);
    expect(level.loot.name).toBe('SINGULARITY RELIC');
    expect(level.guards.length).toBe(2);
    expect(level.switches.length).toBe(3);
    expect(level.doors.length).toBe(2);
    expect(level.lasers.length).toBe(1);

    // Initial timeline events should be initialized with empty current loop
    expect(state.loopTimelineEvents.length).toBe(1);
    expect(state.loopTimelineEvents[0].length).toBe(0);
  });

  it('should accurately log loop timeline events during player actions', () => {
    const engine = new TimeLoopEngine(0);

    // Walk to switch at (350, 120)
    for (let i = 0; i < 78; i++) engine.step({ dx: 1, dy: 0, interact: false });

    for (let i = 0; i < 56; i++) engine.step({ dx: 0, dy: -1, interact: false });

    const stateLoop1 = engine.getState();
    const events = stateLoop1.loopTimelineEvents[0];
    expect(events.some(e => e.type === 'SWITCH')).toBe(true);
    expect(events.some(e => e.type === 'DOOR')).toBe(true);

    // Rewind to loop 2
    engine.rewindToNextLoop();
    const stateLoop2 = engine.getState();
    // Loop 1 events preserved in past events, and Loop 2 events started
    expect(stateLoop2.loopTimelineEvents.length).toBe(2);
    expect(stateLoop2.loopTimelineEvents[0].some(e => e.type === 'SWITCH')).toBe(true);
  });

  it('should initialize Stage 4 The Quantum Paradox Vault and support quad-loop synchronization', () => {
    const engine = new TimeLoopEngine(4);
    const level = engine.getLevel();
    const state = engine.getState();
    expect(state.status).toBe('RUNNING');

    expect(level.id).toBe('stage-4');
    expect(level.stageNumber).toBe(4);
    expect(level.maxLoops).toBe(4);
    expect(level.loot.name).toBe('CHRONO PARADOX RELIC');
    expect(level.guards.length).toBe(2);
    expect(level.switches.length).toBe(3);
    expect(level.doors.length).toBe(2);
    expect(level.lasers.length).toBe(1);

    // Step across loop 1 to 4
    for (let l = 1; l <= 3; l++) {
      engine.step({ dx: 1, dy: 0, interact: false });
      engine.rewindToNextLoop();
      expect(engine.getState().currentLoopIndex).toBe(l + 1);
      expect(engine.getState().ghostPlayers.length).toBe(l);
    }
  });

  it('should discover and hack data terminals in Stage 0 and emit TERMINAL_HACKED', () => {
    const engine = new TimeLoopEngine(0);
    const initialTerminals = engine.getState().terminals;
    expect(initialTerminals.length).toBeGreaterThan(0);
    const term = initialTerminals[0];
    expect(term.isHacked).toBe(false);

    // Position player directly on terminal
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.x = term.x;
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.y = term.y;

    const events = engine.step({ dx: 0, dy: 0, interact: false });
    expect(events.some(e => e.type === 'TERMINAL_HACKED')).toBe(true);
    expect(term.isHacked).toBe(true);
    expect(engine.getUnlockedTerminalIds()).toContain(term.id);

    // Rewinding loop preserves unlocked dossier terminal
    engine.rewindToNextLoop();
    expect(engine.getState().terminals[0].isHacked).toBe(true);
  });

  it('should contain rich world building, sector lore, and handler comms across all 5 stages', () => {
    for (let idx = 0; idx < 5; idx++) {
      const engine = new TimeLoopEngine(idx);
      const level = engine.getLevel();
      expect(level.facilityName).toBeDefined();
      expect(level.facilityName!.length).toBeGreaterThan(5);
      expect(level.sectorLore).toBeDefined();
      expect(level.sectorLore!.length).toBeGreaterThan(20);
      expect(level.threatLevel).toBeDefined();
      expect(level.terminals).toBeDefined();
      expect(level.terminals!.length).toBeGreaterThan(0);
      expect(level.handlerComms).toBeDefined();
      expect(level.handlerComms!.some(c => c.trigger === 'START')).toBe(true);
    }
  });
});

