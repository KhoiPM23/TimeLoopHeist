# TimeLoopHeist — Temporal Stealth Extraction

A deterministic stealth-puzzle browser game where you pull off high-stakes vault heists by recording and cooperating with time-echoes of your past actions.

![TimeLoopHeist](https://img.shields.io/badge/License-MIT-blue.svg)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)
![Tests](https://img.shields.io/badge/Tests-7%2F7%20Passing-brightgreen.svg)

---

## 🎮 The Core Concept

You are a temporal infiltration operative equipped with a local Chrono-Anchor. When you trigger a rewind (`[R]`), your previous run replays as an ethereal clone while you take on a new role!

The game introduces mechanics progressively so players grasp the concept in under 15 seconds:

### Progressive Stages
1. **Stage 0: Temporal Induction (Tutorial)**:
   - Learn the core time-loop mechanic.
   - Hold Switch [A] to keep the blast gate open, rewind, and walk through as your second self to extract the Access Keycard!
2. **Stage 1: Laser Corridor Bypass**:
   - Cooperate with 2 previous selves (3 instances).
   - Deactivate the southern Laser Security Grid (Switch A), open the Vault Lock (Switch B), dodge the central patrol guard, and extract the Quantum Diamond!
3. **Stage 2: The Quantum Sanctum (Grand Heist)**:
   - High-stakes operation requiring 3 cooperating clones (4 loops).
   - Coordinate across intersecting guard vision cones, dual laser barriers (Switch A & B), and the Sanctum Vault Door (Switch C) to extract the Royal Quantum Core!

---

## 🕹️ Controls

| Control | Action |
| :--- | :--- |
| `W` `A` `S` `D` / `Arrow Keys` | Move operative (with directional slide collision) |
| `R` | **Rewind & Clone**: Commit current loop as a playback ghost and spawn next instance |
| `F` | **Restart Stage**: Reset stage and all loop recordings |
| `P` / `Esc` | **Pause / Resume**: Suspends fixed simulation timestep |
| `M` | **Mute / Unmute**: Toggle procedural Web Audio SFX |
| `Space` / `E` | Interact / Grab Vault Objective |

---

## 🛠️ Architecture & Engineering

### 1. Deterministic Replay Engine
- **Decoupled Simulation**: Simulation logic lives in `src/simulation/engine.ts` with a fixed **50Hz (20ms/tick)** simulation timestep.
- **Input Stream Recording**: The engine records discrete player inputs (`{ dx, dy, interact }`), NOT rendered screen coordinates.
- **Zero Drift Guarantee**: Replaying the recorded input buffer against identical simulation rules produces bitwise-exact actor coordinates and event triggers across any hardware or framerate.

### 2. High-Performance Presenter (Canvas2D + WebGL)
- 60 FPS rendering optimized for integrated GPUs (Intel Iris Xe).
- Dynamic radial flashlight vision cones with raycasted wall occlusion.
- Glowing laser grids, animated chevron extraction pathways, and temporal particles.

### 3. Procedural Browser-Native Web Audio
- 100% offline synthesized sound effects (footsteps, mechanical switch relays, laser hum, alarm klaxon, tape rewind whoosh, victory fanfare) via native browser Web Audio API. Zero external audio asset loading failures.

---

## 🧪 Testing & Verification

Run the automated Vitest test suite:
```bash
npm test
```

Build production bundle:
```bash
npm run build
```

Run local dev server:
```bash
npm run dev
```

---

## 📜 Credits & License
Developed as part of the GameLab portfolio project.  
MIT License.
