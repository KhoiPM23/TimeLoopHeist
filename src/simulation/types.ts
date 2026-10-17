export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerInput {
  dx: number; // -1, 0, or 1
  dy: number; // -1, 0, or 1
  interact: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  radius: number;
  hasLoot: boolean;
  isAlive: boolean;
  facingAngle: number;
}

export interface GuardState {
  id: string;
  x: number;
  y: number;
  facingAngle: number;
  speed: number;
  waypoints: Vector2D[];
  currentWaypointIdx: number;
  fov: number; // in radians
  viewDistance: number;
  isAlerted: boolean;
}

export interface SwitchState {
  id: string;
  x: number;
  y: number;
  radius: number;
  isPressed: boolean;
  color: string;
  label: string;
}

export interface DoorState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  openProgress: number; // 0 to 1
  requiredSwitches: string[];
}

export interface LaserState {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  controlledBySwitch?: string; // If pressed, laser turns OFF
}

export interface LootState {
  id: string;
  x: number;
  y: number;
  radius: number;
  isCollected: boolean;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  maxTicks: number; // e.g. 900 ticks = 18s at 50Hz
  maxLoops: number; // e.g. 3
  spawn: Vector2D;
  extraction: { x: number; y: number; width: number; height: number };
  walls: Wall[];
  guards: GuardState[];
  switches: SwitchState[];
  doors: DoorState[];
  lasers: LaserState[];
  loot: LootState;
}

export type GameStatus = 'RUNNING' | 'REWINDING' | 'WON' | 'BUSTED' | 'OUT_OF_TIME';

export interface GameState {
  status: GameStatus;
  currentTick: number;
  maxTicks: number;
  currentLoopIndex: number;
  maxLoops: number;
  activePlayer: PlayerState;
  ghostPlayers: PlayerState[];
  guards: GuardState[];
  switches: SwitchState[];
  doors: DoorState[];
  lasers: LaserState[];
  loot: LootState;
  alarmTriggered: boolean;
  alarmReason?: string;
  levelCompleted: boolean;
}

export interface SimEvent {
  type: 'ALARM' | 'LOOT_TAKEN' | 'SWITCH_DOWN' | 'SWITCH_UP' | 'DOOR_OPEN' | 'DOOR_CLOSE' | 'WIN' | 'DEATH';
  reason?: string;
  position?: Vector2D;
}
