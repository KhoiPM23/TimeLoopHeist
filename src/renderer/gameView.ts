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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public addParticle(x: number, y: number, color = '#00e5ff', count = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: Math.random() * 20 + 20,
        color,
        size: Math.random() * 3 + 1.5
      });
    }
  }

  public render(state: GameState, level: LevelConfig, events: SimEvent[]): void {
    this.animTime += 0.03;
    const { ctx } = this;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Process event particles
    for (const ev of events) {
      if (ev.position) {
        if (ev.type === 'SWITCH_DOWN') {
          this.addParticle(ev.position.x, ev.position.y, '#00ffaa', 12);
        } else if (ev.type === 'LOOT_TAKEN') {
          this.addParticle(ev.position.x, ev.position.y, '#00ffff', 24);
        } else if (ev.type === 'ALARM') {
          this.addParticle(ev.position.x, ev.position.y, '#ff4444', 30);
        }
      }
    }

    // 1. Background Grid & Flooring
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Subtle security floor grid
    ctx.strokeStyle = '#141d2b';
    ctx.lineWidth = 1;
    const gridSize = 40;
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

    // 2. Extraction Zone
    const ex = level.extraction;
    const hasLoot = state.activePlayer.hasLoot;
    const exAlpha = hasLoot ? 0.15 + Math.sin(this.animTime * 6) * 0.08 : 0.08;
    ctx.fillStyle = `rgba(0, 229, 255, ${exAlpha})`;
    ctx.fillRect(ex.x, ex.y, ex.width, ex.height);

    ctx.strokeStyle = hasLoot ? '#00ffaa' : '#00e5ff';
    ctx.lineWidth = hasLoot ? 2.5 : 1.5;
    ctx.strokeRect(ex.x, ex.y, ex.width, ex.height);

    ctx.fillStyle = hasLoot ? '#00ffaa' : '#00e5ff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hasLoot ? '>>> ESCAPE HERE <<<' : 'ESCAPE ZONE', ex.x + ex.width / 2, ex.y + ex.height / 2 + 4);

    // 3. Walls
    for (const w of level.walls) {
      // Drop shadow for walls
      ctx.fillStyle = '#05070a';
      ctx.fillRect(w.x + 3, w.y + 3, w.width, w.height);

      ctx.fillStyle = '#1c2638';
      ctx.fillRect(w.x, w.y, w.width, w.height);

      ctx.strokeStyle = '#324460';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x, w.y, w.width, w.height);
    }

    // 4. Switches
    for (const sw of state.switches) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.fillStyle = sw.isPressed ? 'rgba(0, 255, 170, 0.4)' : 'rgba(255, 170, 0, 0.15)';
      ctx.fill();

      ctx.strokeStyle = sw.isPressed ? '#00ffaa' : sw.color;
      ctx.lineWidth = sw.isPressed ? 3 : 2;
      ctx.shadowColor = sw.isPressed ? '#00ffaa' : sw.color;
      ctx.shadowBlur = sw.isPressed ? 15 : 6;
      ctx.stroke();

      // Outer pulsing ring when not pressed
      if (!sw.isPressed) {
        const pulseR = sw.radius + Math.sin(this.animTime * 4) * 4;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner pad
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = sw.isPressed ? '#00ffaa' : sw.color;
      ctx.fill();
      ctx.restore();

      // Label
      ctx.fillStyle = '#8ea1bd';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, sw.x, sw.y + sw.radius + 14);
    }

    // 5. Doors
    for (const d of state.doors) {
      const openHeight = d.height * (1 - d.openProgress);
      if (openHeight > 0) {
        ctx.save();
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(d.x, d.y, d.width, openHeight);

        // Hazard stripes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < openHeight; i += 12) {
          ctx.moveTo(d.x, d.y + i);
          ctx.lineTo(d.x + d.width, d.y + i + 6);
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = d.isOpen ? '#00ffaa' : '#ffaa00';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(d.isOpen ? 'UNLOCKED' : 'LOCKED', d.x + d.width / 2, d.y - 6);
    }

    // 6. Lasers
    for (const l of state.lasers) {
      if (!l.isActive) continue;

      ctx.save();
      const pulse = Math.sin(this.animTime * 8) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(255, 40, 40, ${pulse})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff2828';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      // Laser emitters on ends
      ctx.fillStyle = '#ff2828';
      ctx.fillRect(l.x1 - 3, l.y1 - 6, 6, 12);
      ctx.fillRect(l.x2 - 3, l.y2 - 6, 6, 12);
      ctx.restore();
    }

    // 7. Guards & Vision Cones
    for (const guard of state.guards) {
      ctx.save();

      // Flashlight cone
      const coneGradient = ctx.createRadialGradient(
        guard.x, guard.y, 10,
        guard.x, guard.y, guard.viewDistance
      );
      coneGradient.addColorStop(0, 'rgba(255, 230, 100, 0.45)');
      coneGradient.addColorStop(1, 'rgba(255, 200, 50, 0.0)');

      ctx.fillStyle = coneGradient;
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

      // Guard Body
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Guard Flashlight direction indicator
      ctx.strokeStyle = '#ffe664';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.lineTo(
        guard.x + Math.cos(guard.facingAngle) * 16,
        guard.y + Math.sin(guard.facingAngle) * 16
      );
      ctx.stroke();

      ctx.restore();
    }

    // 8. Loot
    if (!state.loot.isCollected) {
      ctx.save();
      const bounce = Math.sin(this.animTime * 4) * 3;
      const lx = state.loot.x;
      const ly = state.loot.y + bounce;

      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(lx, ly - 14);
      ctx.lineTo(lx + 12, ly);
      ctx.lineTo(lx, ly + 14);
      ctx.lineTo(lx - 12, ly);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.loot.name, lx, ly - 18);
      ctx.restore();
    }

    // 9. Ghost Players (Loop Clones)
    state.ghostPlayers.forEach((ghost, idx) => {
      ctx.save();
      const ghostAlpha = 0.55 + Math.sin(this.animTime * 4 + idx) * 0.15;
      ctx.globalAlpha = ghostAlpha;

      const colors = ['#00e5ff', '#ff00ea', '#ffea00'];
      const ghostColor = colors[idx % colors.length];

      ctx.fillStyle = ghostColor;
      ctx.shadowColor = ghostColor;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, ghost.radius, 0, Math.PI * 2);
      ctx.fill();

      // Direction indicator
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ghost.x, ghost.y);
      ctx.lineTo(
        ghost.x + Math.cos(ghost.facingAngle) * (ghost.radius + 4),
        ghost.y + Math.sin(ghost.facingAngle) * (ghost.radius + 4)
      );
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CLONE ${idx + 1}`, ghost.x, ghost.y - ghost.radius - 4);

      ctx.restore();
    });

    // 10. Active Player
    const p = state.activePlayer;
    ctx.save();
    ctx.fillStyle = '#00ff66';
    ctx.shadowColor = '#00ff66';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(
      p.x + Math.cos(p.facingAngle) * (p.radius + 6),
      p.y + Math.sin(p.facingAngle) * (p.radius + 6)
    );
    ctx.stroke();

    // Carrying loot marker
    if (p.hasLoot) {
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 18, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU (ACTIVE)', p.x, p.y - p.radius - 6);
    ctx.restore();

    // 11. Render Particles
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

    // 12. In-Game Contextual Tutorial Hint Banner
    if (state.activeHint) {
      ctx.save();
      const bannerW = 600;
      const bannerH = 34;
      const bannerX = (width - bannerW) / 2;
      const bannerY = 48;

      ctx.fillStyle = 'rgba(10, 16, 26, 0.9)';
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

      ctx.fillStyle = '#00e5ff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.activeHint, width / 2, bannerY + 21);
      ctx.restore();
    }

    // 13. Pause Overlay
    if (state.status === 'PAUSED') {
      ctx.save();
      ctx.fillStyle = 'rgba(6, 9, 14, 0.75)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00e5ff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SIMULATION SUSPENDED // PAUSED', width / 2, height / 2 - 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('Press [P] or Click RESUME to Continue', width / 2, height / 2 + 24);
      ctx.restore();
    }
  }
}
