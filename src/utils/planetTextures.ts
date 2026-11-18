import * as THREE from 'three';

// Cache generated textures
const textureCache: Record<string, THREE.CanvasTexture> = {};

export function getPlanetTexture(type: string): THREE.CanvasTexture {
  if (textureCache[type]) {
    return textureCache[type];
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'sun': {
      // Radiant solar surface with granulation and sunspots
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#fff3a8');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Noise flares
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = Math.random() * 20 + 5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 200, 0.25)' : 'rgba(217, 119, 6, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'earth': {
      // Deep blue ocean
      ctx.fillStyle = '#0f386b';
      ctx.fillRect(0, 0, 1024, 512);

      // Continents (approximate continental landmasses)
      ctx.fillStyle = '#2d6a4f';
      const continents = [
        // North & South America
        { x: 220, y: 140, rx: 90, ry: 60 },
        { x: 270, y: 320, rx: 70, ry: 90 },
        // Eurasia & Africa
        { x: 550, y: 150, rx: 140, ry: 70 },
        { x: 530, y: 280, rx: 80, ry: 90 },
        // Australia
        { x: 820, y: 340, rx: 60, ry: 40 },
        // Antarctica
        { x: 512, y: 480, rx: 450, ry: 30 }
      ];

      for (const c of continents) {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner terrain variation
        ctx.fillStyle = '#52b788';
        ctx.beginPath();
        ctx.ellipse(c.x + 10, c.y + 10, c.rx * 0.7, c.ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d6a4f';
      }

      // Swirling clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const rx = Math.random() * 50 + 20;
        const ry = Math.random() * 12 + 4;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.sin(x * 0.05) * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'jupiter': {
      // Jupiter zonal bands (belts and zones)
      const bandColors = [
        '#d4a373', '#faedcd', '#ccd5ae', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03',
        '#faedcd', '#d4a373', '#e76f51', '#f4a261', '#e9c46a', '#d4a373'
      ];
      const bandHeight = 512 / bandColors.length;
      for (let i = 0; i < bandColors.length; i++) {
        ctx.fillStyle = bandColors[i];
        ctx.fillRect(0, i * bandHeight, 1024, bandHeight + 2);
      }

      // Add atmospheric turbulence and ripples
      for (let y = 0; y < 512; y += 4) {
        ctx.fillStyle = `rgba(${Math.floor(Math.sin(y * 0.1) * 40 + 200)}, 140, 80, 0.15)`;
        ctx.fillRect(0, y, 1024, 4);
      }

      // Great Red Spot
      ctx.fillStyle = '#b7094c';
      ctx.beginPath();
      ctx.ellipse(650, 310, 65, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.ellipse(650, 310, 45, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'saturn': {
      // Golden butterscotch bands
      for (let y = 0; y < 512; y++) {
        const factor = 0.5 + 0.5 * Math.sin(y * 0.08);
        const r = Math.floor(215 + factor * 25);
        const g = Math.floor(190 + factor * 20);
        const b = Math.floor(140 + factor * 30);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, y, 1024, 1);
      }
      break;
    }

    case 'uranus': {
      // Pale cyan-aquamarine atmosphere
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#70d6ff');
      grad.addColorStop(0.5, '#99f6e4');
      grad.addColorStop(1, '#5eead4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
      break;
    }

    case 'neptune': {
      // Deep azure / cobalt blue with high-altitude white storm streaks
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(0.5, '#2563eb');
      grad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Neptune Great Dark Spot
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(420, 240, 55, 30, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Bright white methane cirrus cloud streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 180 + 160;
        ctx.beginPath();
        ctx.ellipse(x, y, Math.random() * 40 + 15, Math.random() * 4 + 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'mars': {
      // Rust red and desert orange
      ctx.fillStyle = '#c85a32';
      ctx.fillRect(0, 0, 1024, 512);
      // Dark basalt maria
      ctx.fillStyle = '#7a3e20';
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 300 + 100;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 40 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // White polar ice caps
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 25);
      ctx.fillRect(0, 487, 1024, 25);
      break;
    }

    case 'venus': {
      // Featureless yellowish-cream cloud deck
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);
      break;
    }

    case 'mercury':
    default: {
      // Gray cratered rocky surface
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 1024, 512);
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 20 + 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache[type] = texture;
  return texture;
}

/**
 * Generate transparent ring texture for Saturn and outer planets
 */
export function getRingsTexture(): THREE.CanvasTexture {
  if (textureCache['rings']) return textureCache['rings'];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(235, 215, 175, 0.0)');
  grad.addColorStop(0.15, 'rgba(235, 215, 175, 0.7)');
  grad.addColorStop(0.45, 'rgba(215, 195, 150, 0.9)');
  grad.addColorStop(0.55, 'rgba(50, 40, 20, 0.05)'); // Cassini Division!
  grad.addColorStop(0.62, 'rgba(225, 205, 160, 0.8)');
  grad.addColorStop(0.85, 'rgba(210, 185, 140, 0.6)');
  grad.addColorStop(1.0, 'rgba(200, 180, 130, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache['rings'] = texture;
  return texture;
}
