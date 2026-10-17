import { LevelConfig } from './types';

export const ALL_LEVELS: LevelConfig[] = [
  // STAGE 0: TUTORIAL
  {
    id: 'stage-0',
    stageNumber: 0,
    name: 'STAGE 0: TEMPORAL INDUCTION',
    subtitle: 'Learn the basic time echo loop protocol.',
    objectiveText: 'Step on Switch [A] to open the door, press [R] to record, then walk through as your new self!',
    maxTicks: 750, // 15 seconds at 50Hz
    maxLoops: 2,
    spawn: { x: 100, y: 300 },
    extraction: { x: 40, y: 250, width: 90, height: 100 },
    walls: [
      // Outer boundaries
      { x: 0, y: 0, width: 900, height: 20 },
      { x: 0, y: 580, width: 900, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 880, y: 0, width: 20, height: 600 },

      // Partition separating switch alcove
      { x: 220, y: 20, width: 20, height: 160 },
      { x: 220, y: 380, width: 20, height: 200 },

      // Door wall
      { x: 500, y: 20, width: 20, height: 230 },
      { x: 500, y: 350, width: 20, height: 230 }
    ],
    guards: [],
    switches: [
      {
        id: 'switch-tut',
        x: 350,
        y: 120,
        radius: 24,
        isPressed: false,
        color: '#00e5ff',
        label: 'GATE OVERRIDE [A]'
      }
    ],
    doors: [
      {
        id: 'door-tut',
        x: 500,
        y: 250,
        width: 20,
        height: 100,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['switch-tut']
      }
    ],
    lasers: [],
    loot: {
      id: 'loot-keycard',
      name: 'VAULT ACCESS KEYCARD',
      x: 720,
      y: 300,
      radius: 16,
      isCollected: false
    },
    hints: [
      {
        trigger: 'START',
        text: '1. Walk north to Switch [A]. Step on it to open the blast gate.'
      },
      {
        trigger: 'ON_SWITCH',
        text: '2. Gate opened! Press [R] to record your past self holding it down!'
      },
      {
        trigger: 'AFTER_REWIND',
        text: '3. Your clone is holding the gate open! Walk through, grab the keycard, and escape!'
      }
    ]
  },

  // STAGE 1: DUAL SWITCH & LASER GRID
  {
    id: 'stage-1',
    stageNumber: 1,
    name: 'STAGE 1: LASER CORRIDOR BYPASS',
    subtitle: 'Cooperate with 2 recorded past selves to disarm lasers and open the vault.',
    objectiveText: 'Loop 1: Hold Switch A (Laser). Loop 2: Hold Switch B (Door). Loop 3: Grab Vault Diamond & escape!',
    maxTicks: 900, // 18 seconds at 50Hz
    maxLoops: 3,
    spawn: { x: 80, y: 500 },
    extraction: { x: 40, y: 450, width: 90, height: 100 },
    walls: [
      // Outer boundaries
      { x: 0, y: 0, width: 900, height: 20 },
      { x: 0, y: 580, width: 900, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 880, y: 0, width: 20, height: 600 },

      // Left lobby divider (with open entrance gap)
      { x: 180, y: 0, width: 20, height: 380 },
      { x: 180, y: 460, width: 20, height: 140 },

      // Center divider between north switch room and guard corridor
      { x: 180, y: 220, width: 300, height: 20 },

      // Barrier separating Laser corridor
      { x: 480, y: 360, width: 20, height: 240 },

      // Vault wall
      { x: 680, y: 20, width: 20, height: 180 },
      { x: 680, y: 280, width: 20, height: 320 }
    ],
    guards: [
      {
        id: 'guard-01',
        x: 280,
        y: 300,
        facingAngle: 0,
        speed: 2.2,
        waypoints: [
          { x: 280, y: 300 },
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
        id: 'door-vault-1',
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
      name: 'QUANTUM DIAMOND',
      x: 780,
      y: 120,
      radius: 16,
      isCollected: false
    }
  },

  // STAGE 2: THE GRAND HEIST
  {
    id: 'stage-2',
    stageNumber: 2,
    name: 'STAGE 2: THE QUANTUM SANCTUM',
    subtitle: 'Coordinate 3 clones across intersecting patrol lines and dual laser barriers.',
    objectiveText: 'Coordinate 3 past echoes: Disable Outer & Inner Lasers, unseal the Sanctum, and extract!',
    maxTicks: 1100, // 22 seconds at 50Hz
    maxLoops: 4,
    spawn: { x: 80, y: 300 },
    extraction: { x: 40, y: 250, width: 80, height: 100 },
    walls: [
      // Outer boundaries
      { x: 0, y: 0, width: 900, height: 20 },
      { x: 0, y: 580, width: 900, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 880, y: 0, width: 20, height: 600 },

      // West chamber wall
      { x: 180, y: 20, width: 20, height: 210 },
      { x: 180, y: 370, width: 20, height: 210 },

      // North Switch room divider
      { x: 180, y: 230, width: 240, height: 20 },
      { x: 400, y: 20, width: 20, height: 230 },

      // South Switch room divider
      { x: 180, y: 350, width: 240, height: 20 },
      { x: 400, y: 350, width: 20, height: 230 },

      // Central Sanctum Vault
      { x: 640, y: 150, width: 20, height: 110 },
      { x: 640, y: 340, width: 20, height: 110 },
      { x: 640, y: 150, width: 220, height: 20 },
      { x: 640, y: 430, width: 220, height: 20 }
    ],
    guards: [
      {
        id: 'guard-patrol-north',
        x: 460,
        y: 120,
        facingAngle: Math.PI / 2,
        speed: 2.4,
        waypoints: [
          { x: 460, y: 100 },
          { x: 460, y: 480 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3,
        viewDistance: 170,
        isAlerted: false
      },
      {
        id: 'guard-patrol-east',
        x: 580,
        y: 500,
        facingAngle: -Math.PI / 2,
        speed: 2.0,
        waypoints: [
          { x: 580, y: 500 },
          { x: 580, y: 100 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3.2,
        viewDistance: 160,
        isAlerted: false
      }
    ],
    switches: [
      {
        id: 'sw-north',
        x: 290,
        y: 120,
        radius: 20,
        isPressed: false,
        color: '#00e5ff',
        label: 'PERIMETER LASER [A]'
      },
      {
        id: 'sw-south',
        x: 290,
        y: 470,
        radius: 20,
        isPressed: false,
        color: '#ff00ea',
        label: 'INNER LASER [B]'
      },
      {
        id: 'sw-east',
        x: 530,
        y: 300,
        radius: 20,
        isPressed: false,
        color: '#ffea00',
        label: 'SANCTUM DOOR [C]'
      }
    ],
    doors: [
      {
        id: 'door-sanctum',
        x: 640,
        y: 260,
        width: 20,
        height: 80,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['sw-east']
      }
    ],
    lasers: [
      {
        id: 'laser-outer',
        x1: 410,
        y1: 290,
        x2: 410,
        y2: 350,
        isActive: true,
        controlledBySwitch: 'sw-north'
      },
      {
        id: 'laser-inner',
        x1: 470,
        y1: 260,
        x2: 570,
        y2: 260,
        isActive: true,
        controlledBySwitch: 'sw-south'
      }
    ],
    loot: {
      id: 'loot-crown-jewels',
      name: 'ROYAL QUANTUM CORE',
      x: 750,
      y: 295,
      radius: 18,
      isCollected: false
    }
  },

  // STAGE 3: THE OBSIDIAN VAULT (Climax Master Heist)
  {
    id: 'stage-3',
    stageNumber: 3,
    name: 'STAGE 3: THE OBSIDIAN VAULT',
    subtitle: 'The high-security subterranean sanctum. Zero margin for temporal desynchronization.',
    objectiveText: 'Coordinate 3 clones across dual-layer security: bypass perimeter lasers, sync with the central sentry, and extract the Singularity Relic.',
    maxTicks: 1250, // 25s at 50Hz
    maxLoops: 4,
    spawn: { x: 80, y: 300 },
    extraction: { x: 30, y: 240, width: 90, height: 120 },
    walls: [
      // Outer boundaries
      { x: 0, y: 0, width: 900, height: 20 },
      { x: 0, y: 580, width: 900, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 880, y: 0, width: 20, height: 600 },

      // Perimeter security gate
      { x: 190, y: 20, width: 20, height: 200 },
      { x: 190, y: 380, width: 20, height: 200 },

      // North generator room
      { x: 190, y: 200, width: 220, height: 20 },
      { x: 390, y: 20, width: 20, height: 200 },

      // South substation room
      { x: 190, y: 380, width: 220, height: 20 },
      { x: 390, y: 380, width: 20, height: 200 },

      // Inner chamber partition
      { x: 580, y: 80, width: 20, height: 160 },
      { x: 580, y: 360, width: 20, height: 160 },

      // Vault Core
      { x: 700, y: 160, width: 20, height: 100 },
      { x: 700, y: 340, width: 20, height: 100 },
      { x: 700, y: 160, width: 170, height: 20 },
      { x: 700, y: 420, width: 170, height: 20 }
    ],
    guards: [
      {
        id: 'guard-obsidian-north',
        x: 480,
        y: 100,
        facingAngle: Math.PI / 2,
        speed: 2.2,
        waypoints: [
          { x: 480, y: 80 },
          { x: 480, y: 500 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3,
        viewDistance: 175,
        isAlerted: false
      },
      {
        id: 'guard-obsidian-vault',
        x: 640,
        y: 490,
        facingAngle: -Math.PI / 2,
        speed: 2.4,
        waypoints: [
          { x: 640, y: 490 },
          { x: 640, y: 110 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3,
        viewDistance: 165,
        isAlerted: false
      }
    ],
    switches: [
      {
        id: 'sw-obs-laser',
        x: 290,
        y: 100,
        radius: 20,
        isPressed: false,
        color: '#00e5ff',
        label: 'PERIMETER LASER [A]'
      },
      {
        id: 'sw-obs-substation',
        x: 290,
        y: 490,
        radius: 20,
        isPressed: false,
        color: '#ff00ea',
        label: 'CORE LASER [B]'
      },
      {
        id: 'sw-obs-vault',
        x: 640,
        y: 300,
        radius: 22,
        isPressed: false,
        color: '#ffea00',
        label: 'OBSIDIAN DOOR [C]'
      }
    ],
    doors: [
      {
        id: 'door-obsidian-perimeter',
        x: 190,
        y: 220,
        width: 20,
        height: 160,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['sw-obs-laser']
      },
      {
        id: 'door-obsidian-vault',
        x: 700,
        y: 260,
        width: 20,
        height: 80,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['sw-obs-vault']
      }
    ],
    lasers: [
      {
        id: 'laser-obs-corridor',
        x1: 410,
        y1: 290,
        x2: 560,
        y2: 290,
        isActive: true,
        controlledBySwitch: 'sw-obs-substation'
      }
    ],
    loot: {
      id: 'loot-obsidian-core',
      name: 'SINGULARITY RELIC',
      x: 790,
      y: 295,
      radius: 20,
      isCollected: false
    }
  }
];

