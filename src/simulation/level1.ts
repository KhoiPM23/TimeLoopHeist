import { LevelConfig } from './types';

export const LEVEL_1: LevelConfig = {
  id: 'vault-01',
  name: 'First Federal Vault: Midnight Extraction',
  maxTicks: 900, // 18 seconds at 50Hz
  maxLoops: 3,
  spawn: { x: 80, y: 500 },
  extraction: { x: 40, y: 450, width: 90, height: 100 },
  walls: [
    // Outer boundary walls
    { x: 0, y: 0, width: 900, height: 20 },
    { x: 0, y: 580, width: 900, height: 20 },
    { x: 0, y: 0, width: 20, height: 600 },
    { x: 880, y: 0, width: 20, height: 600 },

    // Interior partitions:
    // Left lobby divider (with open entrance gap)
    { x: 180, y: 0, width: 20, height: 380 },
    { x: 180, y: 460, width: 20, height: 140 },

    // Center divider between north switch room and guard corridor
    { x: 180, y: 220, width: 300, height: 20 },

    // Barrier separating Laser corridor
    { x: 480, y: 360, width: 20, height: 240 },

    // Vault wall (with doorway at y: 190..270)
    { x: 680, y: 20, width: 20, height: 180 },
    { x: 680, y: 280, width: 20, height: 320 },
  ],
  guards: [
    {
      id: 'guard-01',
      x: 300,
      y: 300,
      facingAngle: 0,
      speed: 2.2,
      waypoints: [
        { x: 300, y: 300 },
        { x: 600, y: 300 }
      ],
      currentWaypointIdx: 0,
      fov: Math.PI / 3, // 60 degrees
      viewDistance: 190,
      isAlerted: false
    }
  ],
  switches: [
    {
      id: 'switch-a',
      x: 340,
      y: 120,
      radius: 22,
      isPressed: false,
      color: '#00e5ff',
      label: 'LASER OVERRIDE [A]'
    },
    {
      id: 'switch-b',
      x: 580,
      y: 490,
      radius: 22,
      isPressed: false,
      color: '#ffea00',
      label: 'VAULT LOCK [B]'
    }
  ],
  doors: [
    {
      id: 'door-vault',
      x: 680,
      y: 200,
      width: 20,
      height: 80,
      isOpen: false,
      openProgress: 0,
      requiredSwitches: ['switch-b']
    }
  ],
  lasers: [
    {
      id: 'laser-01',
      x1: 490,
      y1: 420,
      x2: 670,
      y2: 420,
      isActive: true,
      controlledBySwitch: 'switch-a'
    }
  ],
  loot: {
    id: 'vault-diamond',
    x: 780,
    y: 120,
    radius: 16,
    isCollected: false
  }
};
