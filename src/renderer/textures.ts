import * as THREE from 'three';

/**
 * Procedural PBR and diffuse canvas textures for high-fidelity 3D Vault environment.
 * Generated entirely client-side without external asset dependencies.
 */
export class VaultTextures {
  private static floorTexture: THREE.CanvasTexture | null = null;
  private static wallTexture: THREE.CanvasTexture | null = null;
  private static doorTexture: THREE.CanvasTexture | null = null;
  private static extractionTexture: THREE.CanvasTexture | null = null;

  public static getFloorTexture(): THREE.CanvasTexture {
    if (this.floorTexture) return this.floorTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base high-security polished slate floor
    ctx.fillStyle = '#0b1320';
    ctx.fillRect(0, 0, 512, 512);

    // Floor tile grid (64x64 tiles)
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const tileGrad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
        tileGrad.addColorStop(0, '#101a2e');
        tileGrad.addColorStop(0.5, '#0e1728');
        tileGrad.addColorStop(1, '#13213a');
        ctx.fillStyle = tileGrad;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Tile joint lines
        ctx.strokeStyle = '#050a14';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Micro-noise for terrazzo stone texture
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // High-tech cyber floor circuits
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(192, 128);
    ctx.lineTo(256, 192);
    ctx.lineTo(512, 192);
    ctx.moveTo(256, 192);
    ctx.lineTo(256, 384);
    ctx.lineTo(384, 512);
    ctx.stroke();

    this.floorTexture = new THREE.CanvasTexture(canvas);
    this.floorTexture.wrapS = THREE.RepeatWrapping;
    this.floorTexture.wrapT = THREE.RepeatWrapping;
    this.floorTexture.repeat.set(4, 4);
    return this.floorTexture;
  }

  public static getWallTexture(): THREE.CanvasTexture {
    if (this.wallTexture) return this.wallTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Reinforced concrete & ballistic composite
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Horizontal concrete formwork lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    for (let y = 64; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Steel reinforcement plates & bolts
    ctx.fillStyle = '#334155';
    for (let y = 32; y < 512; y += 64) {
      for (let x = 64; x < 512; x += 128) {
        ctx.fillRect(x - 16, y - 8, 32, 16);

        // Bolts
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(x - 8, y, 2, 0, Math.PI * 2);
        ctx.arc(x + 8, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
      }
    }

    // Top metallic rim trim
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 512, 16);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(0, 0, 512, 16);

    this.wallTexture = new THREE.CanvasTexture(canvas);
    this.wallTexture.wrapS = THREE.RepeatWrapping;
    this.wallTexture.wrapT = THREE.RepeatWrapping;
    return this.wallTexture;
  }

  public static getDoorTexture(): THREE.CanvasTexture {
    if (this.doorTexture) return this.doorTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Heavy vault steel plate
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#475569');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Beveled center lock mechanism
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 32, 192, 192);

    // Industrial hazard stripes on door header & footer
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 28);
    ctx.fillRect(0, 228, 256, 28);

    ctx.fillStyle = '#0f172a';
    for (let x = -64; x < 320; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 16, 0);
      ctx.lineTo(x + 44, 28);
      ctx.lineTo(x + 28, 28);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, 228);
      ctx.lineTo(x + 16, 228);
      ctx.lineTo(x + 44, 256);
      ctx.lineTo(x + 28, 256);
      ctx.closePath();
      ctx.fill();
    }

    // Hydraulic lock pins
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(116, 96, 24, 64);

    this.doorTexture = new THREE.CanvasTexture(canvas);
    return this.doorTexture;
  }

  public static getExtractionTexture(): THREE.CanvasTexture {
    if (this.extractionTexture) return this.extractionTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Glowing holographic landing pad
    ctx.fillStyle = 'rgba(0, 255, 170, 0.12)';
    ctx.fillRect(0, 0, 256, 256);

    // Extraction perimeter boundary
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);

    // Inner concentric chevron brackets
    ctx.lineWidth = 2.5;
    ctx.strokeRect(32, 32, 192, 192);

    // Central evacuation logo
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#00ffaa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EVAC', 128, 128);

    this.extractionTexture = new THREE.CanvasTexture(canvas);
    return this.extractionTexture;
  }
}
