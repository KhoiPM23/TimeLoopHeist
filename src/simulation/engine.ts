import { ALL_LEVELS } from './levels';
import {
  GameState,
  GuardState,
  LevelConfig,
  LoopTimelineEvent,
  PlayerInput,
  PlayerState,
  SimEvent,
  Wall
} from './types';

export class TimeLoopEngine {
  private levelIndex: number = 0;
  private level: LevelConfig;
  private currentLoopIndex: number = 0;
  private loopRecordings: PlayerInput[][] = [];
  private currentLoopInputs: PlayerInput[] = [];
  private pastLoopEvents: LoopTimelineEvent[][] = [];
  private currentLoopEvents: LoopTimelineEvent[] = [];

  private currentTick: number = 0;
  private state: GameState;
  private playerSpeed: number = 3.2;

  constructor(initialLevelIndex = 0) {
    this.levelIndex = Math.max(0, Math.min(ALL_LEVELS.length - 1, initialLevelIndex));
    this.level = JSON.parse(JSON.stringify(ALL_LEVELS[this.levelIndex]));
    this.state = this.initInitialState();
  }

  public getLevelIndex(): number {
    return this.levelIndex;
  }

  public getTotalLevels(): number {
    return ALL_LEVELS.length;
  }

  public loadLevel(index: number): void {
    if (index < 0 || index >= ALL_LEVELS.length) return;
    this.levelIndex = index;
    this.level = JSON.parse(JSON.stringify(ALL_LEVELS[this.levelIndex]));
    this.resetEntireRun();
  }

  public nextLevel(): boolean {
    if (this.levelIndex < ALL_LEVELS.length - 1) {
      this.loadLevel(this.levelIndex + 1);
      return true;
    }
    return false;
  }

  private initInitialState(): GameState {
    const activePlayer: PlayerState = {
      x: this.level.spawn.x,
      y: this.level.spawn.y,
      radius: 12,
      hasLoot: false,
      isAlive: true,
      facingAngle: 0
    };

    const ghostPlayers: PlayerState[] = [];
    for (let i = 0; i < this.currentLoopIndex; i++) {
      ghostPlayers.push({
        x: this.level.spawn.x,
        y: this.level.spawn.y,
        radius: 12,
        hasLoot: false,
        isAlive: true,
        facingAngle: 0
      });
    }

    let initialHint: string | undefined = undefined;
    if (this.level.hints) {
      if (this.currentLoopIndex === 0) {
        initialHint = this.level.hints.find(h => h.trigger === 'START')?.text;
      } else {
        initialHint = this.level.hints.find(h => h.trigger === 'AFTER_REWIND')?.text;
      }
    }

    return {
      status: 'RUNNING',
      currentTick: 0,
      maxTicks: this.level.maxTicks,
      currentLoopIndex: this.currentLoopIndex + 1,
      maxLoops: this.level.maxLoops,
      activePlayer,
      ghostPlayers,
      guards: JSON.parse(JSON.stringify(this.level.guards)),
      switches: JSON.parse(JSON.stringify(this.level.switches)),
      doors: JSON.parse(JSON.stringify(this.level.doors)),
      lasers: JSON.parse(JSON.stringify(this.level.lasers)),
      loot: JSON.parse(JSON.stringify(this.level.loot)),
      alarmTriggered: false,
      levelCompleted: false,
      activeHint: initialHint,
      loopTimelineEvents: [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]]
    };
  }


  public getState(): Readonly<GameState> {
    return this.state;
  }

  public getLevel(): Readonly<LevelConfig> {
    return this.level;
  }

  public setPaused(paused: boolean): void {
    if (paused && this.state.status === 'RUNNING') {
      this.state.status = 'PAUSED';
    } else if (!paused && this.state.status === 'PAUSED') {
      this.state.status = 'RUNNING';
    }
  }

  public step(liveInput: PlayerInput): SimEvent[] {
    const events: SimEvent[] = [];
    if (this.state.status !== 'RUNNING') {
      return events;
    }

    // 1. Record live input
    this.currentLoopInputs.push({ ...liveInput });

    // 2. Simulate Ghost Players from recordings
    for (let g = 0; g < this.state.ghostPlayers.length; g++) {
      const ghost = this.state.ghostPlayers[g];
      const recorded = this.loopRecordings[g];
      const input = recorded && this.currentTick < recorded.length
        ? recorded[this.currentTick]
        : { dx: 0, dy: 0, interact: false };

      this.moveActor(ghost, input);
    }

    // 3. Simulate Active Player
    this.moveActor(this.state.activePlayer, liveInput);

    // 4. Update Guards
    this.updateGuards();

    // 5. Update Switches
    const allActors = [this.state.activePlayer, ...this.state.ghostPlayers];
    let isAnySwitchPressedByActivePlayer = false;

    for (const sw of this.state.switches) {
      const wasPressed = sw.isPressed;
      sw.isPressed = allActors.some(actor => {
        const distSq = (actor.x - sw.x) ** 2 + (actor.y - sw.y) ** 2;
        return distSq <= (actor.radius + sw.radius) ** 2;
      });

      // Check if active player specifically is on this switch (for tutorial hint)
      const distToActive = Math.hypot(this.state.activePlayer.x - sw.x, this.state.activePlayer.y - sw.y);
      if (distToActive <= this.state.activePlayer.radius + sw.radius) {
        isAnySwitchPressedByActivePlayer = true;
      }

      if (!wasPressed && sw.isPressed) {
        events.push({ type: 'SWITCH_DOWN', position: { x: sw.x, y: sw.y } });
        this.currentLoopEvents.push({ tick: this.currentTick, type: 'SWITCH', label: sw.label });
      } else if (wasPressed && !sw.isPressed) {
        events.push({ type: 'SWITCH_UP', position: { x: sw.x, y: sw.y } });
      }
    }

    // Tutorial dynamic hint progression
    if (this.level.hints) {
      if (this.currentLoopIndex === 0) {
        if (isAnySwitchPressedByActivePlayer) {
          const onSwitchHint = this.level.hints.find(h => h.trigger === 'ON_SWITCH');
          if (onSwitchHint) this.state.activeHint = onSwitchHint.text;
        } else if (!this.state.activeHint) {
          const startHint = this.level.hints.find(h => h.trigger === 'START');
          if (startHint) this.state.activeHint = startHint.text;
        }
      } else {
        const rewindHint = this.level.hints.find(h => h.trigger === 'AFTER_REWIND');
        if (rewindHint) this.state.activeHint = rewindHint.text;
      }
    }

    // 6. Update Lasers (Controlled by switches)
    for (const laser of this.state.lasers) {
      if (laser.controlledBySwitch) {
        const sw = this.state.switches.find(s => s.id === laser.controlledBySwitch);
        laser.isActive = sw ? !sw.isPressed : true;
      }

      // Check collision with any actor if laser is active
      if (laser.isActive) {
        for (const actor of allActors) {
          if (this.checkPointToSegmentCollision(actor.x, actor.y, actor.radius, laser.x1, laser.y1, laser.x2, laser.y2)) {
            this.state.alarmTriggered = true;
            this.state.status = 'BUSTED';
            this.state.alarmReason = 'Laser grid breached!';
            events.push({ type: 'ALARM', reason: this.state.alarmReason });
            this.currentLoopEvents.push({ tick: this.currentTick, type: 'ALARM', label: 'Laser Grid Alert' });
            this.state.loopTimelineEvents = [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]];
            return events;
          }
        }
      }
    }

    // 7. Update Doors
    for (const door of this.state.doors) {
      const allSwitchesMet = door.requiredSwitches.every(reqId => {
        const sw = this.state.switches.find(s => s.id === reqId);
        return sw && sw.isPressed;
      });

      const wasOpen = door.isOpen;
      door.isOpen = allSwitchesMet;
      if (door.isOpen && door.openProgress < 1) {
        door.openProgress = Math.min(1, door.openProgress + 0.1);
        if (!wasOpen) {
          events.push({ type: 'DOOR_OPEN' });
          this.currentLoopEvents.push({ tick: this.currentTick, type: 'DOOR', label: 'Blast Gate Open' });
        }
      } else if (!door.isOpen && door.openProgress > 0) {
        door.openProgress = Math.max(0, door.openProgress - 0.1);
        if (wasOpen) events.push({ type: 'DOOR_CLOSE' });
      }
    }

    // 8. Guard Detection (Line of sight / Vision cone)
    for (const guard of this.state.guards) {
      for (const actor of allActors) {
        if (this.canGuardSeeActor(guard, actor)) {
          this.state.alarmTriggered = true;
          this.state.status = 'BUSTED';
          this.state.alarmReason = 'Spotted by patrol guard!';
          events.push({ type: 'ALARM', reason: this.state.alarmReason, position: { x: guard.x, y: guard.y } });
          this.currentLoopEvents.push({ tick: this.currentTick, type: 'ALARM', label: 'Guard Line-of-Sight' });
          this.state.loopTimelineEvents = [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]];
          return events;
        }
      }
    }

    // 9. Loot Interaction (Active Player)
    if (!this.state.loot.isCollected) {
      const distToLoot = Math.hypot(this.state.activePlayer.x - this.state.loot.x, this.state.activePlayer.y - this.state.loot.y);
      if (distToLoot <= this.state.activePlayer.radius + this.state.loot.radius + 6) {
        if (liveInput.interact || distToLoot <= this.state.activePlayer.radius + this.state.loot.radius) {
          this.state.loot.isCollected = true;
          this.state.activePlayer.hasLoot = true;
          events.push({ type: 'LOOT_TAKEN', position: { x: this.state.loot.x, y: this.state.loot.y } });
          this.currentLoopEvents.push({ tick: this.currentTick, type: 'LOOT', label: this.state.loot.name });
        }
      }
    }

    // 10. Extraction Check (Win condition)
    if (this.state.activePlayer.hasLoot) {
      const ex = this.level.extraction;
      const p = this.state.activePlayer;
      if (p.x >= ex.x && p.x <= ex.x + ex.width && p.y >= ex.y && p.y <= ex.y + ex.height) {
        this.state.status = 'WON';
        this.state.levelCompleted = true;
        events.push({ type: 'WIN' });
        this.state.loopTimelineEvents = [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]];
        return events;
      }
    }

    // 11. Advance Tick
    this.currentTick++;
    this.state.currentTick = this.currentTick;
    this.state.loopTimelineEvents = [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]];
    if (this.currentTick >= this.level.maxTicks) {
      this.state.status = 'OUT_OF_TIME';
      this.state.alarmReason = 'Time window expired!';
      events.push({ type: 'ALARM', reason: this.state.alarmReason });
      this.currentLoopEvents.push({ tick: this.currentTick, type: 'ALARM', label: 'Time Expired' });
      this.state.loopTimelineEvents = [...this.pastLoopEvents.map(e => [...e]), [...this.currentLoopEvents]];
    }

    return events;
  }


  private moveActor(actor: PlayerState, input: PlayerInput): void {
    if (input.dx === 0 && input.dy === 0) return;

    const length = Math.hypot(input.dx, input.dy) || 1;
    const nx = input.dx / length;
    const ny = input.dy / length;

    const moveX = nx * this.playerSpeed;
    const moveY = ny * this.playerSpeed;

    // Slide on axes for smooth navigation
    const targetX = actor.x + moveX;
    if (!this.collidesWithWalls(targetX, actor.y, actor.radius)) {
      actor.x = targetX;
    }

    const targetY = actor.y + moveY;
    if (!this.collidesWithWalls(actor.x, targetY, actor.radius)) {
      actor.y = targetY;
    }

    actor.facingAngle = Math.atan2(ny, nx);
  }

  private collidesWithWalls(x: number, y: number, radius: number): boolean {
    for (const wall of this.level.walls) {
      if (this.circleIntersectsRect(x, y, radius, wall.x, wall.y, wall.width, wall.height)) {
        return true;
      }
    }

    // Check closed doors
    for (const door of this.state.doors) {
      if (door.openProgress < 0.8) {
        if (this.circleIntersectsRect(x, y, radius, door.x, door.y, door.width, door.height)) {
          return true;
        }
      }
    }

    return false;
  }

  private circleIntersectsRect(cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number): boolean {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (r * r);
  }

  private updateGuards(): void {
    for (const guard of this.state.guards) {
      if (guard.waypoints.length === 0) continue;

      const target = guard.waypoints[guard.currentWaypointIdx];
      const dx = target.x - guard.x;
      const dy = target.y - guard.y;
      const dist = Math.hypot(dx, dy);

      if (dist < guard.speed) {
        guard.x = target.x;
        guard.y = target.y;
        guard.currentWaypointIdx = (guard.currentWaypointIdx + 1) % guard.waypoints.length;
      } else {
        guard.x += (dx / dist) * guard.speed;
        guard.y += (dy / dist) * guard.speed;
        guard.facingAngle = Math.atan2(dy, dx);
      }
    }
  }

  private canGuardSeeActor(guard: GuardState, actor: PlayerState): boolean {
    const dx = actor.x - guard.x;
    const dy = actor.y - guard.y;
    const dist = Math.hypot(dx, dy);

    if (dist > guard.viewDistance) return false;

    // Check FOV
    const angleToActor = Math.atan2(dy, dx);
    let diff = Math.abs(angleToActor - guard.facingAngle);
    while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);

    if (diff > guard.fov / 2) return false;

    // Raycast wall & door blocking
    return !this.isLineBlockedByWalls(guard.x, guard.y, actor.x, actor.y);
  }

  private isLineBlockedByWalls(x1: number, y1: number, x2: number, y2: number): boolean {
    const blockers: Wall[] = [...this.level.walls];
    for (const door of this.state.doors) {
      if (door.openProgress < 0.8) {
        blockers.push({ x: door.x, y: door.y, width: door.width, height: door.height });
      }
    }

    for (const b of blockers) {
      if (this.lineIntersectsRect(x1, y1, x2, y2, b.x, b.y, b.width, b.height)) {
        return true;
      }
    }
    return false;
  }

  private lineIntersectsRect(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return this.lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
           this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
           this.lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
           this.lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry);
  }

  private lineIntersectsLine(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  private checkPointToSegmentCollision(px: number, py: number, r: number, x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;
    const distSq = (px - nearestX) ** 2 + (py - nearestY) ** 2;
    return distSq <= r * r;
  }

  public rewindToNextLoop(): boolean {
    // If we've reached max loops, restart run from loop 1
    if (this.currentLoopIndex >= this.level.maxLoops - 1) {
      this.resetEntireRun();
      return false;
    }

    // Save current recording and event timeline
    this.loopRecordings[this.currentLoopIndex] = [...this.currentLoopInputs];
    this.pastLoopEvents[this.currentLoopIndex] = [...this.currentLoopEvents];
    this.currentLoopInputs = [];
    this.currentLoopEvents = [];
    this.currentLoopIndex++;
    this.currentTick = 0;
    this.state = this.initInitialState();
    return true;
  }

  public resetCurrentLoop(): void {
    this.currentLoopInputs = [];
    this.currentLoopEvents = [];
    this.currentTick = 0;
    this.state = this.initInitialState();
  }

  public resetEntireRun(): void {
    this.currentLoopIndex = 0;
    this.loopRecordings = [];
    this.currentLoopInputs = [];
    this.pastLoopEvents = [];
    this.currentLoopEvents = [];
    this.currentTick = 0;
    this.state = this.initInitialState();
  }
}

