import { describe, expect, it } from 'vitest';
import { TimeLoopEngine } from '../engine';
import { LEVEL_1 } from '../level1';
import { PlayerInput } from '../types';

describe('TimeLoopHeist Deterministic Simulation Engine', () => {
  it('should initialize with correct default state', () => {
    const engine = new TimeLoopEngine(LEVEL_1);
    const state = engine.getState();

    expect(state.status).toBe('RUNNING');
    expect(state.currentTick).toBe(0);
    expect(state.currentLoopIndex).toBe(1);
    expect(state.maxLoops).toBe(3);
    expect(state.activePlayer.x).toBe(LEVEL_1.spawn.x);
    expect(state.activePlayer.y).toBe(LEVEL_1.spawn.y);
    expect(state.ghostPlayers.length).toBe(0);
  });

  it('should deterministically move player and record inputs', () => {
    const engine = new TimeLoopEngine(LEVEL_1);
    const rightInput: PlayerInput = { dx: 1, dy: 0, interact: false };

    // Move right for 20 ticks
    for (let i = 0; i < 20; i++) {
      engine.step(rightInput);
    }

    const state = engine.getState();
    expect(state.currentTick).toBe(20);
    expect(state.activePlayer.x).toBeGreaterThan(LEVEL_1.spawn.x);
  });

  it('should replay ghost actions in loop 2 from loop 1 recording', () => {
    const engine = new TimeLoopEngine(LEVEL_1);

    // Loop 1: Run right and up
    for (let i = 0; i < 50; i++) {
      engine.step({ dx: 1, dy: 0, interact: false });
    }
    const loop1FinalX = engine.getState().activePlayer.x;

    // Rewind to Loop 2
    const advanced = engine.rewindToNextLoop();
    expect(advanced).toBe(true);

    const loop2InitialState = engine.getState();
    expect(loop2InitialState.currentLoopIndex).toBe(2);
    expect(loop2InitialState.ghostPlayers.length).toBe(1);

    // Step Loop 2 for 50 ticks (Ghost should replay Loop 1 actions while active player stands still)
    for (let i = 0; i < 50; i++) {
      engine.step({ dx: 0, dy: 0, interact: false });
    }

    const loop2FinalState = engine.getState();
    // Ghost 0 position at tick 50 must match Loop 1 active player position at tick 50!
    expect(loop2FinalState.ghostPlayers[0].x).toBe(loop1FinalX);
  });

  it('should activate switch when an actor stands on it', () => {
    const engine = new TimeLoopEngine(LEVEL_1);
    const sw = LEVEL_1.switches[0]; // Switch A at (340, 120)

    // Force player directly onto switch coordinates
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.x = sw.x;
    (engine as unknown as { state: { activePlayer: { x: number; y: number } } }).state.activePlayer.y = sw.y;

    const events = engine.step({ dx: 0, dy: 0, interact: false });
    const state = engine.getState();
    const switchA = state.switches.find(s => s.id === sw.id);

    expect(switchA?.isPressed).toBe(true);
    expect(events.some(e => e.type === 'SWITCH_DOWN')).toBe(true);

    // Laser 01 should be disabled when Switch A is pressed
    const laser01 = state.lasers.find(l => l.id === 'laser-01');
    expect(laser01?.isActive).toBe(false);
  });
});
