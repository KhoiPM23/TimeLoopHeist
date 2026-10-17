# TimeLoopHeist — Temporal Stealth Extraction

A deterministic stealth-puzzle game where you pull off high-stakes bank heists by cooperating with time-clones of your own past actions.

![TimeLoopHeist](https://img.shields.io/badge/License-MIT-blue.svg)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)
![Tests](https://img.shields.io/badge/Tests-4%2F4%20Passing-brightgreen.svg)

---

## 🎮 The Core Concept

You have **3 time loops** to infiltrate the First Federal Vault, disarm security grids, grab the Quantum Diamond, and escape. Every time you trigger a rewind, your previous run replays as an ethereal clone!

- **Loop 1 (Clone 1)**: Sprint to **Switch A** to hold down the pressure plate and deactivate the southern Laser Security Grid. Rewind!
- **Loop 2 (Clone 2)**: Slip through the deactivated laser corridor to **Switch B** and open the reinforced Vault Door. Rewind!
- **Loop 3 (You)**: Infiltrate the opened vault room while your clones hold the switches, grab the Quantum Diamond, avoid the patrol guard's flashlight, and sprint to the Escape Zone!

---

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| `W` `A` `S` `D` / `Arrow Keys` | Move operative |
| `R` | **Rewind & Clone**: Commit current loop and spawn next clone |
| `F` | **Restart Heist**: Reset all loops and start fresh from Loop 1 |
| `Space` / `E` | Interact / Grab Vault Diamond |

---

## 🛠️ Architecture & Determinism

1. **Decoupled Simulation Engine**: Game logic runs in a pure deterministic state step `(state, input) => (nextState, events)` at a fixed **50Hz (20ms/tick)**.
2. **Deterministic Replay Guarantee**: Ghost actors replay exact recorded discrete inputs on identical ticks. Zero floating-point physics drift.
3. **Hardware Acceleration**: 60 FPS Canvas rendering optimized for integrated GPUs (Intel Iris Xe) with dynamic radial flashlight vision cones, glowing laser grids, and ambient dropshadows.
4. **Procedural Web Audio**: 100% offline synthesized sound effects (footsteps, relay switches, laser hum, alarm klaxon, rewind synth whoosh, victory fanfare) via native browser Web Audio API.

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

## 📜 License
MIT License.
