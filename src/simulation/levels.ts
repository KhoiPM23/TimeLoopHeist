import { LevelConfig } from './types';

export const ALL_LEVELS: LevelConfig[] = [
  // STAGE 0: TUTORIAL
  {
    id: 'stage-0',
    stageNumber: 0,
    name: 'STAGE 0: TEMPORAL INDUCTION',
    subtitle: 'Learn the basic time echo loop protocol.',
    facilityName: 'Aethelgard Dynamics — Proving Ground Sub-9',
    sectorLore: 'Decommissioned subterranean cold war silo converted by Aethelgard R&D into a closed-circuit causality testing facility. Recruits are fitted with the Chrono-Anchor MK-1 to record retro-causal echoes.',
    threatLevel: 'LOW',
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
    terminals: [
      {
        id: 'term-0-1',
        x: 350,
        y: 490,
        radius: 20,
        title: 'CHRONO-ANCHOR MK-1 OPERATOR MANUAL',
        classification: 'CONFIDENTIAL // NET-0x0 INTERNAL',
        author: 'Handler Thorne, Network 0x0',
        date: '2089-03-14',
        loreSnippet: 'The Chrono-Anchor rig maintains your quantum waveform coherence across a 15-second loop window. When you trigger [R], you project your present consciousness back to the spawn anchor while your previous chronological state continues executing its recorded vectors. Beware: your past echoes are physical matter. They can hold doors open, trigger switches, but also trigger alarms if spotted.',
        isHacked: false
      }
    ],
    handlerComms: [
      { trigger: 'START', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Cipher, audio check. You are inside Sub-9. Walk north to Switch [A], step on it to lower the blast gate, then press [R] to record your echo.' },
      { trigger: 'REWIND', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Temporal echo locked! Your past clone is holding Switch [A]. Walk through the gate, secure the keycard, and extract.' },
      { trigger: 'LOOT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Keycard verified. Get to the blue extraction pad on the west wall.' },
      { trigger: 'EXTRACT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Clean extraction. The induction trial is complete. Sub-Vault Alpha awaits.' },
      { trigger: 'HACK', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Data node intercepted. Classified operator manual uploaded to your tactical dossier.' }
    ],
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
    facilityName: 'Sub-Vault Alpha — High-Flux Laser Perimeter',
    sectorLore: 'Aethelgard outer transit hub housing automated laser defense emitters. Built directly over geothermal heat sinks to supply uninterrupted power to the containment chambers.',
    threatLevel: 'MEDIUM',
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
    },
    terminals: [
      {
        id: 'term-1-1',
        x: 580,
        y: 120,
        radius: 20,
        title: 'MEMORANDUM: FREQUENCY LASER CALIBRATION',
        classification: 'RESTRICTED // AETHELGARD SECURITY',
        author: 'Security Director Sterling',
        date: '2089-08-22',
        loreSnippet: 'The high-flux blue lasers operate on a 420nm ionization frequency designed to vaporize intrusion drones within 4 milliseconds. Due to union safety mandates, emergency cutoff switch [A] remains wired in the north alcove. Ensure guards sweep the corridor regularly.',
        isHacked: false
      }
    ],
    handlerComms: [
      { trigger: 'START', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Sub-Vault Alpha. Watch that high-flux laser barrier. You will need three loops: one on Switch A, one on Switch B, then grab the Quantum Diamond.' },
      { trigger: 'ALARM', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Breach detected! Anchor collapsed! Press [R] to retry the loop or [F] to reboot the stage!' },
      { trigger: 'LOOT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Quantum Diamond retrieved. High purity lattice confirmed. Evacuate through extraction!' },
      { trigger: 'HACK', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Terminal decrypted: Laser safety logs acquired. Added to your dossier.' }
    ]
  },

  // STAGE 2: THE GRAND HEIST
  {
    id: 'stage-2',
    stageNumber: 2,
    name: 'STAGE 2: THE QUANTUM SANCTUM',
    subtitle: 'Coordinate 3 clones across intersecting patrol lines and dual laser barriers.',
    facilityName: 'Automated Defense Hub — Sector Tartarus',
    sectorLore: 'The automated security perimeter guarded by Mark-IV autonomous sentry units. The facility processes anomalous quantum isotopes synthesized in the lower reactors.',
    threatLevel: 'HIGH',
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
    },
    terminals: [
      {
        id: 'term-2-1',
        x: 750,
        y: 100,
        radius: 20,
        title: 'PATROL DIRECTIVE: MARK-IV SENTRY LOGIC',
        classification: 'TOP SECRET // AETHELGARD R&D',
        author: 'Dr. Evelyn Vance, Head of Autonomous Systems',
        date: '2090-01-19',
        loreSnippet: 'Mark-IV sentries are programmed with deterministic linear sweep routines. Their 60-degree volumetric cones detect biological motion instantly, but they cannot see through blast doors or reinforced composite bulkheads. If a target moves out of visual range before escalation, the sentry continues its programmed route.',
        isHacked: false
      }
    ],
    handlerComms: [
      { trigger: 'START', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Sector Tartarus. Mark-IV sentries are active. Time your movements between their patrol intervals.' },
      { trigger: 'ALARM', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Sentry locked onto you! Rewind immediately!' },
      { trigger: 'LOOT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Royal Quantum Core in possession! Evacuate before the secondary patrol converges!' },
      { trigger: 'HACK', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Sentry patrol logic decrypted. Tactical dossier updated.' }
    ]
  },

  // STAGE 3: THE OBSIDIAN VAULT (Climax Master Heist)
  {
    id: 'stage-3',
    stageNumber: 3,
    name: 'STAGE 3: THE OBSIDIAN VAULT',
    subtitle: 'The high-security subterranean sanctum. Zero margin for temporal desynchronization.',
    facilityName: 'The Obsidian Vault — Anomaly Containment',
    sectorLore: 'A heavily shielded subterranean tomb constructed from reinforced obsidian alloy to contain high-energy temporal distortions. The Singularity Relic held here was retrieved from the first failed causality experiment.',
    threatLevel: 'CRITICAL',
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
    },
    terminals: [
      {
        id: 'term-3-1',
        x: 580,
        y: 300,
        radius: 20,
        title: 'INCIDENT REPORT: PROJECT OUROBOROS INITIATION',
        classification: 'EYES ONLY // EXECUTIVE BOARD',
        author: 'Director Corvus Graves',
        date: '2091-05-11',
        loreSnippet: 'At 03:40, the Prototype Array induced a localized 4-second time loop. Three laboratory technicians observed duplicates of themselves performing actions they had not yet decided to take. When the loop collapsed, the Singularity Relic crystallized at the nexus. We are not just manipulating time; we are fracturing baseline reality.',
        isHacked: false
      }
    ],
    handlerComms: [
      { trigger: 'START', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Obsidian Vault. This place holds the evidence of Aethelgard\'s temporal crimes. Four synchronized echoes required. Make every second count.' },
      { trigger: 'LOOT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Singularity Relic secured! Reality distortion spikes detected! Get to extraction!' },
      { trigger: 'HACK', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Project Ouroboros initiation report archived. This is the smoking gun.' }
    ]
  },

  // STAGE 4: THE QUANTUM PARADOX VAULT
  {
    id: 'stage-4',
    stageNumber: 4,
    name: 'STAGE 4: THE QUANTUM PARADOX VAULT',
    subtitle: 'Triple temporal synchronization across security sectors.',
    facilityName: 'Project Ouroboros Mainframe Core',
    sectorLore: 'The deepest sanctum of Aethelgard Dynamics. Here lies the Chrono Paradox Relic, the master control engine capable of rewriting corporate and military history across global timelines.',
    threatLevel: 'CRITICAL',
    objectiveText: 'Loop 1: Hold North Grid A. Loop 2: Hold South Grid B. Loop 3: Override Core Interlock C. Loop 4: Extract Quantum Relic & escape!',
    maxTicks: 1100, // 22 seconds at 50Hz
    maxLoops: 4,
    spawn: { x: 80, y: 520 },
    extraction: { x: 40, y: 470, width: 90, height: 100 },
    walls: [
      // Outer boundaries
      { x: 0, y: 0, width: 900, height: 20 },
      { x: 0, y: 580, width: 900, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 880, y: 0, width: 20, height: 600 },

      // Ingress partition
      { x: 190, y: 0, width: 20, height: 220 },
      { x: 190, y: 380, width: 20, height: 220 },

      // Core chamber partition
      { x: 590, y: 60, width: 20, height: 180 },
      { x: 590, y: 360, width: 20, height: 180 },

      // Vault Core
      { x: 720, y: 150, width: 20, height: 100 },
      { x: 720, y: 350, width: 20, height: 100 },
      { x: 720, y: 150, width: 150, height: 20 },
      { x: 720, y: 430, width: 150, height: 20 }
    ],
    guards: [
      {
        id: 'guard-q-north',
        x: 480,
        y: 110,
        facingAngle: Math.PI / 2,
        speed: 2.3,
        waypoints: [
          { x: 480, y: 90 },
          { x: 480, y: 510 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3,
        viewDistance: 175,
        isAlerted: false
      },
      {
        id: 'guard-q-vault',
        x: 650,
        y: 480,
        facingAngle: -Math.PI / 2,
        speed: 2.5,
        waypoints: [
          { x: 650, y: 480 },
          { x: 650, y: 120 }
        ],
        currentWaypointIdx: 0,
        fov: Math.PI / 3,
        viewDistance: 170,
        isAlerted: false
      }
    ],
    switches: [
      {
        id: 'sw-q-laser1',
        x: 260,
        y: 90,
        radius: 22,
        isPressed: false,
        color: '#00e5ff',
        label: 'PERIMETER GATE [A]'
      },
      {
        id: 'sw-q-laser2',
        x: 260,
        y: 490,
        radius: 22,
        isPressed: false,
        color: '#ff00ea',
        label: 'ENERGY SHIELD [B]'
      },
      {
        id: 'sw-q-vault',
        x: 650,
        y: 300,
        radius: 24,
        isPressed: false,
        color: '#ffea00',
        label: 'VAULT OVERRIDE [C]'
      }
    ],
    doors: [
      {
        id: 'door-q-perimeter',
        x: 190,
        y: 220,
        width: 20,
        height: 160,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['sw-q-laser1']
      },
      {
        id: 'door-q-vault',
        x: 720,
        y: 250,
        width: 20,
        height: 100,
        isOpen: false,
        openProgress: 0,
        requiredSwitches: ['sw-q-vault']
      }
    ],
    lasers: [
      {
        id: 'laser-q-mid',
        x1: 410,
        y1: 300,
        x2: 560,
        y2: 300,
        isActive: true,
        controlledBySwitch: 'sw-q-laser2'
      }
    ],
    loot: {
      id: 'loot-quantum-core',
      name: 'CHRONO PARADOX RELIC',
      x: 800,
      y: 295,
      radius: 22,
      isCollected: false
    },
    terminals: [
      {
        id: 'term-4-1',
        x: 260,
        y: 300,
        radius: 20,
        title: 'FINAL TRANSMISSION: THE OUROBOROS MANDATE',
        classification: 'ULTRA // LEVEL 5 SECURITY',
        author: 'Director Corvus Graves',
        date: '2092-10-30',
        loreSnippet: 'To whoever intercepts this: we have crossed the horizon. The Chrono Paradox Core allows infinite revision of any battle, political election, or corporate treaty. If Network 0x0 or their operatives breach this terminal, purge all sub-levels immediately. Causality must remain ours.',
        isHacked: false
      }
    ],
    handlerComms: [
      { trigger: 'START', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'The Mainframe Core. Four clones, dual laser grids, and two sentinel units. This is the final run. Rewrite history, Cipher.' },
      { trigger: 'LOOT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'CHRONO PARADOX RELIC RETRIEVED! The entire facility is destabilizing! RUN TO EXTRACTION!' },
      { trigger: 'EXTRACT', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'EXTRACTION COMPLETE! Aethelgard\'s temporal monopoly is shattered! The timeline is free! Outstanding work, Cipher.' },
      { trigger: 'HACK', sender: 'Handler Thorne', callsign: 'NET-0x0', text: 'Ouroboros master mandate intercepted. The ultimate classified dossier is unlocked.' }
    ]
  }
];

