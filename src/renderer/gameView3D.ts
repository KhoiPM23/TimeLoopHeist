import * as THREE from 'three';
import { DoorState, GameState, GuardState, LaserState, LevelConfig, LootState, PlayerState, SimEvent, SwitchState } from '../simulation/types';
import { VaultTextures } from './textures';

interface Particle3D {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
  mesh?: THREE.Mesh;
}

export class GameRenderer3D {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Camera & Viewport
  private cameraTarget = new THREE.Vector3(500, -325, 0);
  private cameraPos = new THREE.Vector3(500, -620, 580);
  private screenShakeAmount = 0;
  private rewindEffectTimer = 0;
  private animTime = 0;
  private clock = new THREE.Clock();

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private alarmPointLight!: THREE.PointLight;

  // Scene Meshes & Groups
  private floorMesh: THREE.Mesh | null = null;
  private wallMeshes: THREE.Mesh[] = [];
  private switchMeshes = new Map<string, THREE.Group>();
  private doorMeshes = new Map<string, THREE.Group>();
  private laserMeshes = new Map<string, THREE.Group>();
  private lootMeshes = new Map<string, THREE.Group>();
  private extractionMesh: THREE.Mesh | null = null;

  // Characters
  private playerGroup = new THREE.Group();
  private cloneGroups: THREE.Group[] = [];
  private guardGroups = new Map<string, THREE.Group>();

  // Particles
  private particles: Particle3D[] = [];

  // Floor Conduits Line
  private conduitGroup = new THREE.Group();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const width = canvas.width || 1000;
    const height = canvas.height || 650;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070d18'); // High-security stealth dark
    this.scene.fog = new THREE.FogExp2('#070d18', 0.0006);

    // 2. Camera: Angled 3D Isometric Perspective
    this.camera = new THREE.PerspectiveCamera(46, width / height, 10, 3000);
    this.camera.position.set(500, -620, 580);
    this.camera.lookAt(500, -325, 0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Player Character 3D Model
    this.setupPlayerModel();

    this.scene.add(this.conduitGroup);

    window.addEventListener('resize', () => this.handleResize());
  }

  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(new THREE.Color('#1e293b'), 1.5);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 2.2);
    this.sunLight.position.set(400, -800, 700);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 50;
    this.sunLight.shadow.camera.far = 1800;
    const d = 800;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Emergency Siren Point Light
    this.alarmPointLight = new THREE.PointLight(0xef4444, 0, 800);
    this.alarmPointLight.position.set(500, -325, 120);
    this.scene.add(this.alarmPointLight);
  }

  private setupPlayerModel(): void {
    this.playerGroup = this.createOperativeMesh(0x00e5ff, false);
    this.scene.add(this.playerGroup);
  }

  private createOperativeMesh(themeColor: number, isHologram: boolean): THREE.Group {
    const group = new THREE.Group();

    // Body suit (Capsule / Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(7, 8, 22, 12);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = isHologram
      ? new THREE.MeshPhysicalMaterial({
          color: themeColor,
          emissive: themeColor,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.55,
          wireframe: false
        })
      : new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.3,
          metalness: 0.8
        });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = !isHologram;
    group.add(bodyMesh);

    // Helmet with glowing visor
    const headGeo = new THREE.SphereGeometry(6.5, 12, 12);
    const headMat = isHologram
      ? new THREE.MeshBasicMaterial({ color: themeColor, wireframe: true })
      : new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0, 15);
    group.add(headMesh);

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(7, 4, 3);
    const visorMat = new THREE.MeshBasicMaterial({ color: themeColor });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 5, 15);
    group.add(visorMesh);

    // Tactical Backpack
    const packGeo = new THREE.BoxGeometry(8, 6, 12);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, -7, 6);
    group.add(packMesh);

    // Directional orientation arrow indicator
    const arrowGeo = new THREE.ConeGeometry(3, 8, 6);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: themeColor });
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowMesh.position.set(0, 16, 2);
    group.add(arrowMesh);

    return group;
  }

  public addParticle(x: number, y: number, color = '#00e5ff', count = 10, speedMult = 1): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 80 + 30) * speedMult;
      this.particles.push({
        position: new THREE.Vector3(x, -y, 6 + Math.random() * 8),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          -Math.sin(angle) * speed,
          (Math.random() - 0.5) * 40
        ),
        color: new THREE.Color(color),
        size: Math.random() * 2.5 + 1.2,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.3
      });
    }
  }

  public triggerRewindGlitch(): void {
    this.rewindEffectTimer = 1.0;
    this.screenShakeAmount = 14;
  }

  private handleResize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || 650;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  public render(state: GameState, level: LevelConfig, events: SimEvent[]): void {
    const delta = this.clock.getDelta();
    this.animTime += delta;

    // Process events
    for (const ev of events) {
      if (ev.type === 'REWIND') {
        this.triggerRewindGlitch();
      } else if (ev.type === 'ALARM') {
        this.screenShakeAmount = 18;
      } else if (ev.type === 'LOOT_TAKEN' && ev.position) {
        this.addParticle(ev.position.x, ev.position.y, '#f59e0b', 16, 1.5);
      } else if (ev.type === 'DOOR_OPEN' && ev.position) {
        this.addParticle(ev.position.x, ev.position.y, '#00e5ff', 12, 1.0);
      }
    }

    // 1. Build Static Level Geometry on Stage Load/Change
    this.ensureLevelBuilt(level);

    // 2. Sync Switches & Animated Depress
    this.syncSwitches(state.switches);

    // 3. Sync Doors & Sliding Motion
    this.syncDoors(state.doors);

    // 4. Sync Laser Barriers
    this.syncLasers(state.lasers);

    // 5. Sync Loot Data Cores
    this.syncLoot(state.loot);

    // 6. Sync Player Operative
    this.syncPlayer(state.activePlayer);

    // 7. Sync Past Clones (Holographic Echoes)
    this.syncClones(state.ghostPlayers);

    // 8. Sync Guards & Volumetric Spotlights
    this.syncGuards(state.guards);

    // 9. Floor Circuit Conduits
    this.syncConduits(level);

    // 10. Particles
    this.updateParticles(delta);

    // 11. Alarm Siren Lighting
    if (state.alarmTriggered) {
      this.alarmPointLight.intensity = Math.sin(this.animTime * 12) > 0 ? 4.5 : 0.5;
    } else {
      this.alarmPointLight.intensity = 0;
    }

    // 12. Camera Smooth Tracking & Isometric View
    this.updateCamera(state.activePlayer.x, -state.activePlayer.y, delta);

    this.renderer.render(this.scene, this.camera);
  }

  private currentBuiltLevelId = '';

  private ensureLevelBuilt(level: LevelConfig): void {
    if (this.currentBuiltLevelId === level.id) return;
    this.currentBuiltLevelId = level.id;

    // Remove old static geometry
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh);
      this.floorMesh.geometry.dispose();
    }
    for (const w of this.wallMeshes) {
      this.scene.remove(w);
      w.geometry.dispose();
    }
    this.wallMeshes = [];

    // 1. Floor Plane (512x512 tiled)
    const floorTex = VaultTextures.getFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(1200, 800);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.4
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.position.set(500, -350, 0);
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // 2. 3D Architectural Walls (BoxGeometry with bevels & shadows)
    const wallTex = VaultTextures.getWallTexture();
    const wallHeight = 44;

    for (const wall of level.walls) {
      const wGeo = new THREE.BoxGeometry(wall.width, wall.height, wallHeight);
      const wMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.6,
        metalness: 0.5
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      // Center position
      wMesh.position.set(
        wall.x + wall.width / 2,
        -(wall.y + wall.height / 2),
        wallHeight / 2
      );
      wMesh.castShadow = true;
      wMesh.receiveShadow = true;
      this.wallMeshes.push(wMesh);
      this.scene.add(wMesh);
    }

    // 3. Extraction Holographic Pad
    if (this.extractionMesh) {
      this.scene.remove(this.extractionMesh);
    }
    const ext = level.extraction;
    const extTex = VaultTextures.getExtractionTexture();
    const extGeo = new THREE.PlaneGeometry(ext.width, ext.height);
    const extMat = new THREE.MeshBasicMaterial({
      map: extTex,
      transparent: true,
      depthWrite: false
    });
    this.extractionMesh = new THREE.Mesh(extGeo, extMat);
    this.extractionMesh.position.set(ext.x + ext.width / 2, -(ext.y + ext.height / 2), 0.5);
    this.scene.add(this.extractionMesh);
  }

  private syncSwitches(switches: SwitchState[]): void {
    for (const sw of switches) {
      let group = this.switchMeshes.get(sw.id);
      if (!group) {
        group = new THREE.Group();

        // Base ring plate
        const baseGeo = new THREE.CylinderGeometry(sw.radius, sw.radius + 2, 4, 16);
        baseGeo.rotateX(Math.PI / 2);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        group.add(baseMesh);

        // Center pressure button
        const btnGeo = new THREE.CylinderGeometry(sw.radius - 3, sw.radius - 3, 5, 16);
        btnGeo.rotateX(Math.PI / 2);
        const btnMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(sw.color),
          emissive: new THREE.Color(sw.color),
          emissiveIntensity: 0.3
        });
        const btnMesh = new THREE.Mesh(btnGeo, btnMat);
        btnMesh.name = 'pressButton';
        btnMesh.position.z = 2;
        group.add(btnMesh);

        this.switchMeshes.set(sw.id, group);
        this.scene.add(group);
      }

      group.position.set(sw.x, -sw.y, 0);

      // Physical depression animation when stepped on
      const btn = group.getObjectByName('pressButton') as THREE.Mesh;
      if (btn) {
        btn.position.z = sw.isPressed ? 0.4 : 2.5;
        const mat = btn.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = sw.isPressed ? 1.0 : 0.3;
      }
    }
  }

  private syncDoors(doors: DoorState[]): void {
    const doorTex = VaultTextures.getDoorTexture();

    for (const d of doors) {
      let group = this.doorMeshes.get(d.id);
      if (!group) {
        group = new THREE.Group();

        const dGeo = new THREE.BoxGeometry(d.width, d.height, 46);
        const dMat = new THREE.MeshStandardMaterial({
          map: doorTex,
          roughness: 0.3,
          metalness: 0.7
        });
        const dMesh = new THREE.Mesh(dGeo, dMat);
        dMesh.castShadow = true;
        dMesh.receiveShadow = true;
        dMesh.name = 'doorSlab';
        group.add(dMesh);

        this.doorMeshes.set(d.id, group);
        this.scene.add(group);
      }

      // Center position
      const cx = d.x + d.width / 2;
      const cy = -(d.y + d.height / 2);
      group.position.set(cx, cy, 23);

      // Sliding into floor / wall as openProgress approaches 1.0
      const slab = group.getObjectByName('doorSlab') as THREE.Mesh;
      if (slab) {
        slab.position.z = -d.openProgress * 42; // Sinks down into the floor
      }
    }
  }

  private syncLasers(lasers: LaserState[]): void {
    for (const l of lasers) {
      let group = this.laserMeshes.get(l.id);
      if (!group) {
        group = new THREE.Group();

        const dx = l.x2 - l.x1;
        const dy = -(l.y2 - l.y1);
        const len = Math.hypot(dx, dy);

        // Glowing Laser Core Beam
        const beamGeo = new THREE.CylinderGeometry(1.6, 1.6, len, 8);
        beamGeo.rotateZ(Math.atan2(dy, dx) - Math.PI / 2);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.95
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.name = 'laserBeam';
        group.add(beamMesh);

        // Laser emitter post A
        const postGeo = new THREE.CylinderGeometry(4, 5, 24, 12);
        postGeo.rotateX(Math.PI / 2);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
        const postA = new THREE.Mesh(postGeo, postMat);
        postA.position.set(-dx / 2, -dy / 2, 0);
        group.add(postA);

        const postB = new THREE.Mesh(postGeo, postMat);
        postB.position.set(dx / 2, dy / 2, 0);
        group.add(postB);

        this.laserMeshes.set(l.id, group);
        this.scene.add(group);
      }

      const mx = (l.x1 + l.x2) / 2;
      const my = -((l.y1 + l.y2) / 2);
      group.position.set(mx, my, 12);

      const beam = group.getObjectByName('laserBeam') as THREE.Mesh;
      if (beam) {
        beam.visible = l.isActive;
        if (l.isActive) {
          (beam.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(this.animTime * 15) * 0.25;
        }
      }
    }
  }

  private syncLoot(loot: LootState): void {
    let group = this.lootMeshes.get(loot.id);
    if (!group) {
      group = new THREE.Group();

      // 3D Encrypted Diamond Core
      const coreGeo = new THREE.OctahedronGeometry(loot.radius * 0.9, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.8
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.castShadow = true;
      group.add(coreMesh);

      // Orbiting Security Gyro Ring
      const ringGeo = new THREE.TorusGeometry(loot.radius * 1.3, 1.2, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      group.add(ringMesh);

      this.lootMeshes.set(loot.id, group);
      this.scene.add(group);
    }

    group.position.set(loot.x, -loot.y, 14 + Math.sin(this.animTime * 3) * 3);
    group.rotation.x += 0.02;
    group.rotation.y += 0.03;

    group.visible = !loot.isCollected;
  }

  private syncPlayer(player: PlayerState): void {
    this.playerGroup.position.set(player.x, -player.y, 0);
    this.playerGroup.rotation.z = -player.facingAngle - Math.PI / 2;
    this.playerGroup.visible = player.isAlive;
  }

  private syncClones(ghostPlayers: PlayerState[]): void {
    while (this.cloneGroups.length < ghostPlayers.length) {
      const idx = this.cloneGroups.length;
      const cloneColor = idx === 0 ? 0xa855f7 : (idx === 1 ? 0xec4899 : 0x38bdf8);
      const cloneGroup = this.createOperativeMesh(cloneColor, true);
      this.cloneGroups.push(cloneGroup);
      this.scene.add(cloneGroup);
    }

    for (let i = 0; i < this.cloneGroups.length; i++) {
      const grp = this.cloneGroups[i];
      if (i < ghostPlayers.length) {
        const p = ghostPlayers[i];
        grp.position.set(p.x, -p.y, 0);
        grp.rotation.z = -p.facingAngle - Math.PI / 2;
        grp.visible = p.isAlive;
      } else {
        grp.visible = false;
      }
    }
  }

  private syncGuards(guards: GuardState[]): void {
    for (const g of guards) {
      let group = this.guardGroups.get(g.id);
      if (!group) {
        group = new THREE.Group();

        // Enforcer Droid Body (Hexagonal / Beveled)
        const droidGeo = new THREE.CylinderGeometry(8, 10, 24, 6);
        droidGeo.rotateX(Math.PI / 2);
        const droidMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.3,
          metalness: 0.8
        });
        const droidMesh = new THREE.Mesh(droidGeo, droidMat);
        droidMesh.castShadow = true;
        group.add(droidMesh);

        // Volumetric 3D Spotlight Cone
        const coneHeight = g.viewDistance;
        const coneRadius = Math.tan(g.fov / 2) * coneHeight;
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 1, true);
        coneGeo.translate(0, -coneHeight / 2, 0);
        coneGeo.rotateX(Math.PI / 2);

        const coneMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.28,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const coneMesh = new THREE.Mesh(coneGeo, coneMat);
        coneMesh.name = 'searchlight';
        coneMesh.position.set(0, 0, 10);
        group.add(coneMesh);

        this.guardGroups.set(g.id, group);
        this.scene.add(group);
      }

      group.position.set(g.x, -g.y, 0);
      group.rotation.z = -g.facingAngle - Math.PI / 2;

      const light = group.getObjectByName('searchlight') as THREE.Mesh;
      if (light) {
        const mat = light.material as THREE.MeshBasicMaterial;
        mat.color.setHex(g.isAlerted ? 0xef4444 : 0xfef08a);
        mat.opacity = g.isAlerted ? 0.55 : 0.28;
      }
    }
  }

  private syncConduits(level: LevelConfig): void {
    // Generate animated floor conduits linking switches to doors
    if (this.conduitGroup.children.length === 0) {
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.6
      });

      for (const door of level.doors) {
        for (const swId of door.requiredSwitches) {
          const sw = level.switches.find(s => s.id === swId);
          if (sw) {
            const doorCx = door.x + door.width / 2;
            const doorCy = -(door.y + door.height / 2);
            const swCx = sw.x;
            const swCy = -sw.y;

            // Orthogonal corridor conduit path
            const midX = swCx;
            const midY = doorCy;

            const pts = [
              new THREE.Vector3(swCx, swCy, 1),
              new THREE.Vector3(midX, midY, 1),
              new THREE.Vector3(doorCx, doorCy, 1)
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const line = new THREE.Line(geo, lineMat);
            this.conduitGroup.add(line);
          }
        }
      }
    }
  }

  private updateParticles(delta: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        if (p.mesh) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, delta);

      if (!p.mesh) {
        const pGeo = new THREE.SphereGeometry(p.size, 6, 6);
        const pMat = new THREE.MeshBasicMaterial({
          color: p.color,
          transparent: true,
          opacity: 1.0
        });
        p.mesh = new THREE.Mesh(pGeo, pMat);
        this.scene.add(p.mesh);
      }

      p.mesh.position.copy(p.position);
      const alpha = 1 - p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
    }
  }

  private updateCamera(targetX: number, targetY: number, delta: number): void {
    this.cameraTarget.x = THREE.MathUtils.lerp(this.cameraTarget.x, targetX, 0.08);
    this.cameraTarget.y = THREE.MathUtils.lerp(this.cameraTarget.y, targetY, 0.08);

    const desiredCamX = this.cameraTarget.x;
    const desiredCamY = this.cameraTarget.y - 280;
    const desiredCamZ = 520;

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeAmount > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShakeAmount;
      shakeY = (Math.random() - 0.5) * this.screenShakeAmount;
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - delta * 25);
    }

    if (this.rewindEffectTimer > 0) {
      this.rewindEffectTimer = Math.max(0, this.rewindEffectTimer - delta * 2);
      shakeX += (Math.random() - 0.5) * 12;
      shakeY += (Math.random() - 0.5) * 12;
    }

    this.cameraPos.x = THREE.MathUtils.lerp(this.cameraPos.x, desiredCamX + shakeX, 0.08);
    this.cameraPos.y = THREE.MathUtils.lerp(this.cameraPos.y, desiredCamY + shakeY, 0.08);
    this.cameraPos.z = THREE.MathUtils.lerp(this.cameraPos.z, desiredCamZ, 0.08);

    this.camera.position.copy(this.cameraPos);
    this.camera.lookAt(this.cameraTarget.x, this.cameraTarget.y + 40, 0);
  }
}
