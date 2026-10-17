import { GameState, LevelConfig, SimEvent } from '../simulation/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animTime: number = 0;
  private particles: Particle[] = [];
  private rewindEffectTimer: number = 0;
  private playerTrail: { x: number; y: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public addParticle(x: number, y: number, color = '#00e5ff', count = 10, speedMult = 1): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2.5 + 0.8) * speedMult;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: Math.random() * 25 + 20,
        color,
        size: Math.random() * 3 + 1.5
      });
    }
  }

  public triggerRewindGlitch(): void {
    this.rewindEffectTimer = 1.0;
  }

  public render(state: GameState, level: LevelConfig, events: SimEvent[]): void {
    this.animTime += 0.035;
    const { ctx } = this;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Process simulation events
    for (const ev of events) {
      if (ev.type === 'REWIND') {
        this.triggerRewindGlitch();
      } else if (ev.position) {
        if (ev.type === 'SWITCH_DOWN') {
          this.addParticle(ev.position.x, ev.position.y, '#00ffaa', 16, 1.2);
        } else if (ev.type === 'LOOT_TAKEN') {
          this.addParticle(ev.position.x, ev.position.y, '#00e5ff', 30, 2.0);
        } else if (ev.type === 'ALARM') {
          this.addParticle(ev.position.x, ev.position.y, '#ff3344', 36, 2.2);
        }
      }
    }

    // Decay rewind glitch timer
    if (this.rewindEffectTimer > 0) {
      this.rewindEffectTimer = Math.max(0, this.rewindEffectTimer - 0.05);
    }

    // 1. Cyber Security Floor & Grid
    ctx.fillStyle = '#060910';
    ctx.fillRect(0, 0, width, height);

    // Floor tile texture pattern
    ctx.strokeStyle = 'rgba(20, 32, 52, 0.45)';
    ctx.lineWidth = 1;
    const gridSize = 45;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Tech junction accent markers
    ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
    for (let x = gridSize; x < width; x += gridSize * 2) {
      for (let y = gridSize; y < height; y += gridSize * 2) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    // 2. Extraction Zone (Holographic Landing Pad)
    this.renderExtractionZone(level.extraction, state.activePlayer.hasLoot);

    // 3. Walls (2.5D Architectural Depth Extrusion)
    this.renderWalls(level.walls);

    // 4. Switches (3D Beveled Hydraulic Pressure Plates)
    this.renderSwitches(state.switches);

    // 5. Blast Doors (Pneumatic Sliding Gates)
    this.renderDoors(state.doors);

    // 6. Security Lasers (Vibrating Optical Barrier with Floor Glow)
    this.renderLasers(state.lasers);

    // 7. Patrol Guards (Volumetric Vision Cones & Tactical Sentry)
    this.renderGuards(state.guards);

    // 8. Loot (Floating Quantum Relic)
    this.renderLoot(state.loot);

    // 9. Ghost Players (Recorded Past Echoes with Holographic Scanlines)
    this.renderGhostEchoes(state.ghostPlayers, state.switches);

    // 10. Live Player (Tactical Cyber Operative with Footstep Trail)
    this.renderActivePlayer(state.activePlayer);

    // 11. Particles Simulation
    this.renderParticles();

    // 12. Multi-Track Temporal Scrubber UI (Bottom HUD Deck)
    this.renderTimelineDeck(state, level);

    // 13. Contextual Tutorial Hint Banner
    if (state.activeHint) {
      this.renderHintBanner(state.activeHint, width);
    }

    // 14. Rewind Chromatic Glitch Overlay
    if (this.rewindEffectTimer > 0) {
      this.renderRewindGlitch(width, height);
    }

    // 15. Pause & Status Overlays
    if (state.status === 'PAUSED') {
      this.renderPauseOverlay(width, height);
    }
  }

  private renderExtractionZone(ex: { x: number; y: number; width: number; height: number }, hasLoot: boolean): void {
    const { ctx } = this;
    const pulse = (Math.sin(this.animTime * 4) + 1) * 0.5;
    const baseColor = hasLoot ? '0, 255, 170' : '0, 229, 255';

    ctx.save();
    // Soft underglow
    ctx.fillStyle = `rgba(${baseColor}, ${0.06 + pulse * 0.08})`;
    ctx.fillRect(ex.x, ex.y, ex.width, ex.height);

    // Hologram boundary frame
    ctx.strokeStyle = hasLoot ? '#00ffaa' : '#00e5ff';
    ctx.lineWidth = hasLoot ? 2.5 : 1.5;
    ctx.shadowColor = hasLoot ? '#00ffaa' : '#00e5ff';
    ctx.shadowBlur = hasLoot ? 16 : 8;
    ctx.strokeRect(ex.x, ex.y, ex.width, ex.height);

    // Corner targeting brackets
    const cLen = 14;
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(ex.x, ex.y + cLen);
    ctx.lineTo(ex.x, ex.y);
    ctx.lineTo(ex.x + cLen, ex.y);
    // Bottom-right
    ctx.moveTo(ex.x + ex.width - cLen, ex.y + ex.height);
    ctx.lineTo(ex.x + ex.width, ex.y + ex.height);
    ctx.lineTo(ex.x + ex.width, ex.y + ex.height - cLen);
    ctx.stroke();

    // Center icon & status
    ctx.shadowBlur = 0;
    ctx.fillStyle = hasLoot ? '#00ffaa' : '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hasLoot ? '>>> EXTRACTION POINT <<<' : 'EXTRACTION BAY', ex.x + ex.width / 2, ex.y + ex.height / 2 + 4);
    ctx.restore();
  }

  private renderWalls(walls: LevelConfig['walls']): void {
    const { ctx } = this;
    const depthH = 8; // 2.5D depth elevation offset

    for (const w of walls) {
      // 1. Wall Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(w.x + 4, w.y + depthH + 4, w.width, w.height);

      // 2. 2.5D Depth Front Face (Darker architectural extrude)
      ctx.fillStyle = '#0e1624';
      ctx.fillRect(w.x, w.y + depthH, w.width, w.height);

      // 3. Wall Top Facade
      const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.height);
      wallGrad.addColorStop(0, '#1c283c');
      wallGrad.addColorStop(1, '#131c2b');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(w.x, w.y, w.width, w.height);

      // 4. Subtle cyber trim border
      ctx.strokeStyle = '#273a56';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x, w.y, w.width, w.height);

      // Top edge highlight
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.lineTo(w.x + w.width, w.y);
      ctx.stroke();
    }
  }

  private renderSwitches(switches: GameState['switches']): void {
    const { ctx } = this;

    for (const sw of switches) {
      ctx.save();

      // Outer mechanical bevel rim
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Switch status fill
      const activeColor = sw.isPressed ? '#00ffaa' : sw.color;
      ctx.fillStyle = sw.isPressed ? 'rgba(0, 255, 170, 0.45)' : 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing border
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = sw.isPressed ? 3 : 2;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = sw.isPressed ? 18 : 8;
      ctx.stroke();

      // Concentric pulsating warning waves when unpressed
      if (!sw.isPressed) {
        const pulseR = sw.radius + (Math.sin(this.animTime * 5) + 1) * 3;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner hydraulic contact pad
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = activeColor;
      ctx.fill();

      ctx.restore();

      // Tactical label
      ctx.fillStyle = sw.isPressed ? '#00ffaa' : '#cbd5e1';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, sw.x, sw.y + sw.radius + 14);
    }
  }

  private renderDoors(doors: GameState['doors']): void {
    const { ctx } = this;

    for (const d of doors) {
      const openHeight = d.height * (1 - d.openProgress);

      ctx.save();
      // Door frame recess
      ctx.fillStyle = '#090d14';
      ctx.fillRect(d.x - 2, d.y - 2, d.width + 4, d.height + 4);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(d.x - 2, d.y - 2, d.width + 4, d.height + 4);

      if (openHeight > 0) {
        // Metallic blast door slab
        const doorGrad = ctx.createLinearGradient(d.x, d.y, d.x + d.width, d.y);
        doorGrad.addColorStop(0, '#f59e0b');
        doorGrad.addColorStop(0.5, '#fbbf24');
        doorGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = doorGrad;
        ctx.fillRect(d.x, d.y, d.width, openHeight);

        // Industrial hazard stripes
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < openHeight; i += 14) {
          ctx.moveTo(d.x, d.y + i);
          ctx.lineTo(d.x + d.width, d.y + i + 7);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Status indicator LED
      ctx.fillStyle = d.isOpen ? '#00ffaa' : '#f59e0b';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(d.isOpen ? 'UNLOCKED' : 'SEALED', d.x + d.width / 2, d.y - 6);
    }
  }

  private renderLasers(lasers: GameState['lasers']): void {
    const { ctx } = this;

    for (const l of lasers) {
      if (!l.isActive) continue;

      ctx.save();
      const flicker = 0.75 + Math.sin(this.animTime * 14) * 0.25;

      // Outer glow bloom
      ctx.strokeStyle = `rgba(255, 40, 60, ${flicker * 0.35})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      // Core energetic beam
      ctx.strokeStyle = `rgba(255, 60, 80, ${flicker})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff2244';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      // White-hot center filament
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3D Laser Emitter Stanchions
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(l.x1 - 4, l.y1 - 7, 8, 14);
      ctx.fillRect(l.x2 - 4, l.y2 - 7, 8, 14);
      ctx.fillStyle = '#ff2244';
      ctx.beginPath();
      ctx.arc(l.x1, l.y1, 3.5, 0, Math.PI * 2);
      ctx.arc(l.x2, l.y2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderGuards(guards: GameState['guards']): void {
    const { ctx } = this;

    for (const guard of guards) {
      ctx.save();

      // 1. Volumetric Flashlight Search Cone with soft gradient falloff
      const coneGrad = ctx.createRadialGradient(
        guard.x, guard.y, 8,
        guard.x, guard.y, guard.viewDistance
      );
      coneGrad.addColorStop(0, 'rgba(255, 220, 80, 0.45)');
      coneGrad.addColorStop(0.65, 'rgba(255, 200, 50, 0.15)');
      coneGrad.addColorStop(1, 'rgba(255, 180, 0, 0.0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.arc(
        guard.x,
        guard.y,
        guard.viewDistance,
        guard.facingAngle - guard.fov / 2,
        guard.facingAngle + guard.fov / 2
      );
      ctx.closePath();
      ctx.fill();

      // Search cone boundary sweep line
      ctx.strokeStyle = 'rgba(255, 230, 100, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 2. Guard Tactical Body
      ctx.fillStyle = '#ff3344';
      ctx.shadowColor = '#ff3344';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, 13, 0, Math.PI * 2);
      ctx.fill();

      // Helmet visor band
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Directional weapon / flashlight emitter
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.lineTo(
        guard.x + Math.cos(guard.facingAngle) * 18,
        guard.y + Math.sin(guard.facingAngle) * 18
      );
      ctx.stroke();

      ctx.restore();
    }
  }

  private renderLoot(loot: GameState['loot']): void {
    if (loot.isCollected) return;
    const { ctx } = this;
    ctx.save();

    const bob = Math.sin(this.animTime * 4.5) * 4;
    const lx = loot.x;
    const ly = loot.y + bob;

    // Glowing aura
    const aura = ctx.createRadialGradient(lx, ly, 4, lx, ly, 32);
    aura.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    aura.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(lx, ly, 32, 0, Math.PI * 2);
    ctx.fill();

    // 3D Multifaceted Quantum Relic
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(lx, ly - 16);
    ctx.lineTo(lx + 14, ly);
    ctx.lineTo(lx, ly + 16);
    ctx.lineTo(lx - 14, ly);
    ctx.closePath();
    ctx.fill();

    // Inner facet highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(lx, ly - 16);
    ctx.lineTo(lx + 5, ly);
    ctx.lineTo(lx, ly + 16);
    ctx.closePath();
    ctx.fill();

    // Floating item badge
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(loot.name, lx, ly - 22);
    ctx.restore();
  }

  private renderGhostEchoes(ghosts: GameState['ghostPlayers'], switches: GameState['switches']): void {
    const { ctx } = this;
    const ghostColors = ['#00e5ff', '#ff00ea', '#ffea00'];

    ghosts.forEach((ghost, idx) => {
      ctx.save();
      const color = ghostColors[idx % ghostColors.length];
      const alpha = 0.65 + Math.sin(this.animTime * 5 + idx) * 0.15;
      ctx.globalAlpha = alpha;

      // Hologram floor ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ghost.x, ghost.y + ghost.radius, ghost.radius * 1.2, ghost.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ghost Operative Body
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
      ctx.fill();

      // Holographic scanlines across body
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (let sl = -ghost.radius; sl < ghost.radius; sl += 4) {
        ctx.fillRect(ghost.x - ghost.radius, ghost.y + sl, ghost.radius * 2, 1.5);
      }

      // Direction vector
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ghost.x, ghost.y);
      ctx.lineTo(
        ghost.x + Math.cos(ghost.facingAngle) * (ghost.radius + 6),
        ghost.y + Math.sin(ghost.facingAngle) * (ghost.radius + 6)
      );
      ctx.stroke();

      // Real-time Action status tag
      const isHolding = switches.some(s => {
        return Math.hypot(ghost.x - s.x, ghost.y - s.y) <= ghost.radius + s.radius;
      });
      const actionTag = isHolding ? 'HOLDING SWITCH' : 'TEMPORAL ECHO';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CLONE #${idx + 1} [${actionTag}]`, ghost.x, ghost.y - ghost.radius - 6);

      ctx.restore();
    });
  }

  private renderActivePlayer(p: GameState['activePlayer']): void {
    const { ctx } = this;
    ctx.save();

    // Record trail positions
    if (Math.random() < 0.4) {
      this.playerTrail.push({ x: p.x, y: p.y, alpha: 0.6 });
      if (this.playerTrail.length > 8) this.playerTrail.shift();
    }

    // Footsteps trail
    for (let i = this.playerTrail.length - 1; i >= 0; i--) {
      const tr = this.playerTrail[i];
      tr.alpha -= 0.03;
      if (tr.alpha <= 0) {
        this.playerTrail.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(0, 255, 170, ${tr.alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active Player Body (Vivid Tactical Neon)
    ctx.fillStyle = '#00ffaa';
    ctx.shadowColor = '#00ffaa';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Direction pointer
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(
      p.x + Math.cos(p.facingAngle) * (p.radius + 8),
      p.y + Math.sin(p.facingAngle) * (p.radius + 8)
    );
    ctx.stroke();

    // Carrying loot marker
    if (p.hasLoot) {
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 18, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Overhead live indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU (LIVE)', p.x, p.y - p.radius - 8);

    ctx.restore();
  }

  private renderParticles(): void {
    const { ctx } = this;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.03;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderTimelineDeck(state: GameState, level: LevelConfig): void {
    const { ctx } = this;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const deckH = 52;
    const deckY = height - deckH;

    ctx.save();
    // Glassmorphic Deck Background
    ctx.fillStyle = 'rgba(8, 12, 20, 0.92)';
    ctx.fillRect(0, deckY, width, deckH);
    ctx.strokeStyle = '#1e2d44';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, deckY);
    ctx.lineTo(width, deckY);
    ctx.stroke();

    // Deck Header
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`TEMPORAL CHOREOGRAPHY DECK // LOOP ${state.currentLoopIndex} of ${state.maxLoops}`, 16, deckY + 14);

    // Time Progress
    const progress = Math.min(1.0, state.currentTick / level.maxTicks);
    const timeSec = (state.currentTick * 0.02).toFixed(1);
    const maxSec = (level.maxTicks * 0.02).toFixed(1);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${timeSec}s / ${maxSec}s [TICK ${state.currentTick}/${level.maxTicks}]`, width - 16, deckY + 14);

    // Multi-track Scrubber Bar
    const barX = 16;
    const barW = width - 32;
    const barY = deckY + 22;
    const barH = 18;

    // Bar background
    ctx.fillStyle = '#111827';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#273549';
    ctx.strokeRect(barX, barY, barW, barH);

    // Live progress fill
    ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.fillRect(barX, barY, barW * progress, barH);

    // Render Event Markers across loops
    if (state.loopTimelineEvents) {
      state.loopTimelineEvents.forEach((loopEvents) => {
        for (const ev of loopEvents) {

          const evRatio = Math.min(1.0, ev.tick / level.maxTicks);
          const evX = barX + evRatio * barW;

          let markerColor = '#f59e0b';
          if (ev.type === 'DOOR') markerColor = '#10b981';
          if (ev.type === 'LOOT') markerColor = '#00e5ff';
          if (ev.type === 'ALARM') markerColor = '#ef4444';

          ctx.fillStyle = markerColor;
          ctx.beginPath();
          ctx.arc(evX, barY + barH / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Playhead needle
    const playheadX = barX + progress * barW;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, barY - 2);
    ctx.lineTo(playheadX, barY + barH + 2);
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MARKERS: ◆ SWITCH (AMBER)  ■ GATE (GREEN)  ● RELIC (CYAN)  ▲ ALARM (RED)', 16, deckY + 47);

    ctx.restore();
  }

  private renderHintBanner(hintText: string, width: number): void {
    const { ctx } = this;
    ctx.save();
    const bannerW = 620;
    const bannerH = 34;
    const bannerX = (width - bannerW) / 2;
    const bannerY = 46;

    ctx.fillStyle = 'rgba(10, 16, 26, 0.92)';
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hintText, width / 2, bannerY + 21);
    ctx.restore();
  }

  private renderRewindGlitch(width: number, height: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = `rgba(0, 229, 255, ${this.rewindEffectTimer * 0.25})`;
    ctx.fillRect(0, 0, width, height);

    // Horizontal glitch lines
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const gy = Math.random() * height;
      const gh = Math.random() * 4 + 2;
      ctx.fillRect(0, gy, width, gh);
    }
    ctx.restore();
  }

  private renderPauseOverlay(width: number, height: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 9, 14, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SIMULATION SUSPENDED // PAUSED', width / 2, height / 2 - 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('Press [P] or Click RESUME to Continue', width / 2, height / 2 + 24);
    ctx.restore();
  }
}
