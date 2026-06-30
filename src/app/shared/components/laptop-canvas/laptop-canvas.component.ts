import {
  Component,
  ElementRef,
  inject,
  viewChild,
  afterNextRender,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

@Component({
  selector: 'app-laptop-canvas',
  standalone: true,
  templateUrl: './laptop-canvas.component.html',
  styleUrl: './laptop-canvas.component.css',
})
export class LaptopCanvasComponent implements OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly platformId = inject(PLATFORM_ID);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private laptop!: THREE.Group;
  private baseGroup!: THREE.Group;
  private screenGroup!: THREE.Group;
  private screenLight!: THREE.PointLight;
  private allKeys: THREE.Mesh[] = [];
  private activeKeyPresses: {
    mesh: THREE.Mesh;
    originalY: number;
    timer: number;
    duration: number;
    dipDepth: number;
  }[] = [];
  private tick = 0;
  private nextKeyTime = 0;
  private readonly timer = new THREE.Timer();
  private animationId = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    afterNextRender(() => this.init());
  }

  private getSize(): { width: number; height: number } {
    const host = this.el.nativeElement as HTMLElement;
    return {
      width: host.clientWidth || 480,
      height: host.clientHeight || 420,
    };
  }

  private init(): void {
    const canvas = this.canvasRef();
    if (!canvas) return;
    const canvasEl = canvas.nativeElement;

    const size = this.getSize();

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 100);
    this.camera.position.set(2.5, 2.8, 6);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(size.width, size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.resizeObserver = new ResizeObserver(() => {
      const s = this.getSize();
      this.camera.aspect = s.width / s.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(s.width, s.height);
    });
    this.resizeObserver.observe(this.el.nativeElement);

    this.controls = new OrbitControls(this.camera, canvasEl);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();

    this.buildEnvironment();
    this.buildLights();
    this.buildGround();
    this.buildLaptop();
    this.animate();
  }

  private buildEnvironment(): void {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;
    pmrem.dispose();
    this.scene.environment = envTexture;
  }

  private buildLights(): void {
    const ambient = new THREE.AmbientLight(0x5533aa, 0.3);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xccaaff, 2.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x7c3aed, 1.0);
    rimLight.position.set(-4, 5, -5);
    this.scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x8866cc, 0.6, 15);
    fillLight.position.set(-3, 2, 3);
    this.scene.add(fillLight);
  }

  private buildGround(): void {
  }

  // ─── MATERIALS ──────────────────────────────────────────────
  private bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.75,
    roughness: 0.18,
  });

  private innerMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.5,
    roughness: 0.3,
  });

  private rimMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    metalness: 0.85,
    roughness: 0.1,
  });

  private screenMat = new THREE.MeshStandardMaterial({
    color: 0x050510,
    metalness: 0.05,
    roughness: 0.05,
    emissive: 0x050510,
  });

  private keycapMat = new THREE.MeshStandardMaterial({
    color: 0x222244,
    metalness: 0.15,
    roughness: 0.6,
  });

  private rubberMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    metalness: 0,
    roughness: 1,
  });

  private trackpadMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a4e,
    metalness: 0.8,
    roughness: 0.1,
  });

  // ─── BUILD LAPTOP ──────────────────────────────────────────
  private buildLaptop(): void {
    this.laptop = new THREE.Group();
    this.scene.add(this.laptop);

    this.buildBase();
    this.buildKeyboard();
    this.buildScreen();
  }

  private buildBase(): void {
    this.baseGroup = new THREE.Group();
    this.laptop.add(this.baseGroup);

    // Main base
    const baseGeo = new THREE.BoxGeometry(3.6, 0.2, 2.5);
    const baseMesh = new THREE.Mesh(baseGeo, this.bodyMat);
    baseMesh.position.set(0, 0.1, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.baseGroup.add(baseMesh);

    // Purple rim
    const rimGeo = new THREE.BoxGeometry(3.62, 0.02, 2.52);
    const rimMesh = new THREE.Mesh(rimGeo, this.rimMat);
    rimMesh.position.set(0, 0.01, 0);
    this.baseGroup.add(rimMesh);

    // Inner tray
    const trayGeo = new THREE.BoxGeometry(3.3, 0.02, 2.2);
    const trayMesh = new THREE.Mesh(trayGeo, this.innerMat);
    trayMesh.position.set(0, 0.21, 0);
    this.baseGroup.add(trayMesh);

    // Trackpad
    const trackpadGeo = new THREE.BoxGeometry(0.85, 0.012, 0.55);
    const trackpad = new THREE.Mesh(trackpadGeo, this.trackpadMat);
    trackpad.position.set(0, 0.225, 0.7);
    this.baseGroup.add(trackpad);

    // Trackpad border
    const tpBorderGeo = new THREE.BoxGeometry(0.89, 0.004, 0.59);
    const tpBorderMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.8,
      roughness: 0.15,
    });
    const tpBorder = new THREE.Mesh(tpBorderGeo, tpBorderMat);
    tpBorder.position.set(0, 0.222, 0.7);
    this.baseGroup.add(tpBorder);

    // Rubber feet
    const footGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.02, 16);
    const footPositions: [number, number, number][] = [
      [-1.55, 0, -1.05], [1.55, 0, -1.05],
      [-1.55, 0, 1.05],  [1.55, 0, 1.05],
    ];
    footPositions.forEach((pos) => {
      const foot = new THREE.Mesh(footGeo, this.rubberMat);
      foot.position.set(...pos);
      this.baseGroup.add(foot);
    });
  }

  private buildKeyboard(): void {
    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(0, 0.23, -0.1);
    this.baseGroup.add(keyboardGroup);

    const makeKeyTex = (label: string): THREE.CanvasTexture => {
      const kc = document.createElement('canvas');
      kc.width = 64;
      kc.height = 64;
      const kx = kc.getContext('2d')!;
      kx.fillStyle = '#222244';
      kx.fillRect(0, 0, 64, 64);
      kx.fillStyle = 'rgba(200,180,255,0.55)';
      kx.font = 'bold 22px sans-serif';
      kx.textAlign = 'center';
      kx.textBaseline = 'middle';
      kx.fillText(label, 32, 34);
      return new THREE.CanvasTexture(kc);
    };

    const rows: { z: number; keys: number; width: number; xStart: number; labels: string[] }[] = [
      { z: -0.72, keys: 13, width: 0.21, xStart: -1.32, labels: ['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'] },
      { z: -0.5,  keys: 13, width: 0.23, xStart: -1.44, labels: ['`','1','2','3','4','5','6','7','8','9','0','-','='] },
      { z: -0.28, keys: 12, width: 0.23, xStart: -1.34, labels: ['Q','W','E','R','T','Y','U','I','O','P','[',']'] },
      { z: -0.06, keys: 11, width: 0.23, xStart: -1.22, labels: ['A','S','D','F','G','H','J','K','L',';',"'"] },
      { z: 0.16,  keys: 10, width: 0.23, xStart: -1.1,  labels: ['Z','X','C','V','B','N','M',',','.','/'] },
    ];

    rows.forEach((row) => {
      for (let i = 0; i < row.keys; i++) {
        const keyW = row.width - 0.03;
        const label = row.labels[i] || '';
        const kMat = new THREE.MeshStandardMaterial({
          color: 0x222244,
          map: makeKeyTex(label),
          metalness: 0.1,
          roughness: 0.65,
        });
        const keyGeo = new THREE.BoxGeometry(keyW, 0.018, 0.19);
        const key = new THREE.Mesh(keyGeo, kMat);
        key.position.set(row.xStart + i * (row.width + 0.02), 0, row.z);
        keyboardGroup.add(key);
        this.allKeys.push(key);
      }
    });

    // Bottom row
    const bottomKeys: { w: number; x: number; label: string }[] = [
      { w: 0.35, x: -1.15, label: 'ctrl' },
      { w: 0.28, x: -0.77, label: 'opt' },
      { w: 0.35, x: -0.44, label: 'cmd' },
      { w: 1.40, x: 0.22,  label: '' },
      { w: 0.35, x: 0.93,  label: 'cmd' },
      { w: 0.28, x: 1.28,  label: 'opt' },
      { w: 0.19, x: 1.52,  label: '\u25C0' },
      { w: 0.19, x: 1.68,  label: '\u25B6' },
    ];
    bottomKeys.forEach((bk) => {
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x222244,
        map: makeKeyTex(bk.label),
        metalness: 0.1,
        roughness: 0.65,
      });
      const bGeo = new THREE.BoxGeometry(bk.w, 0.018, 0.19);
      const bKey = new THREE.Mesh(bGeo, bMat);
      bKey.position.set(bk.x, 0, 0.38);
      keyboardGroup.add(bKey);
      this.allKeys.push(bKey);
    });
  }

  private buildScreen(): void {
    this.screenGroup = new THREE.Group();
    this.screenGroup.position.set(0, 0.2, -1.25);
    this.laptop.add(this.screenGroup);

    // Initial open angle (will be animated)
    this.screenGroup.rotation.x = -1.35;

    // Lid outer (back casing — behind the screen)
    const lidGeo = new THREE.BoxGeometry(3.6, 0.05, 2.3);
    const lidMesh = new THREE.Mesh(lidGeo, this.bodyMat);
    lidMesh.position.set(0, 0, 0.93);
    lidMesh.castShadow = true;
    this.screenGroup.add(lidMesh);

    // Lid purple rim
    const lidRimGeo = new THREE.BoxGeometry(3.62, 0.015, 2.32);
    const lidRim = new THREE.Mesh(lidRimGeo, this.rimMat);
    lidRim.position.set(0, -0.015, 0.93);
    this.screenGroup.add(lidRim);

    // Bezel (dark frame around the screen)
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x080810,
      metalness: 0.05,
      roughness: 0.95,
    });
    const bezelGeo = new THREE.BoxGeometry(3.38, 0.03, 2.1);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, 0.04, 1.05);
    this.screenGroup.add(bezel);

    // Screen panel (emissive backplate behind the glow)
    const screenPanelGeo = new THREE.BoxGeometry(3.18, 0.01, 1.9);
    const screenPanel = new THREE.Mesh(screenPanelGeo, this.screenMat);
    screenPanel.position.set(0, 0.055, 1.04);
    this.screenGroup.add(screenPanel);

    // ── Screen glow content ─────────────────────────────────
    this.buildScreenContent();

    // Screen light
    this.screenLight = new THREE.PointLight(0x7c3aed, 0.6, 5);
    this.screenLight.position.set(0, 0.4, 0.4);
    this.screenGroup.add(this.screenLight);

    // Webcam notch
    const notchGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12);
    const notchMat = new THREE.MeshStandardMaterial({
      color: 0x080810,
      roughness: 0.85,
      metalness: 0.1,
    });
    const notch = new THREE.Mesh(notchGeo, notchMat);
    notch.rotation.z = Math.PI / 2;
    notch.position.set(0, 0.055, 2.13);
    this.screenGroup.add(notch);

    // Hinges
    const hingeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 20);
    const hingeMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.9,
      roughness: 0.1,
    });
    [-0.72, 0.72].forEach((x) => {
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(x, 0.22, -1.24);
      this.laptop.add(hinge);
    });
  }

  private buildScreenContent(): void {
    const glowGeo = new THREE.PlaneGeometry(3.12, 1.86);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 1024;
    glowCanvas.height = 640;
    const ctx = glowCanvas.getContext('2d')!;

    // Aurora gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, '#0d0221');
    grad.addColorStop(0.25, '#1a0533');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(0.75, '#2d1b69');
    grad.addColorStop(1, '#0d0221');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    // Aurora waves
    for (let w = 0; w < 5; w++) {
      const ag = ctx.createRadialGradient(
        200 + w * 150, 320, 0, 200 + w * 150, 320, 260,
      );
      ag.addColorStop(0, `hsla(${260 + w * 20}, 100%, 60%, 0.13)`);
      ag.addColorStop(1, 'transparent');
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, 1024, 640);
    }

    // Stars
    for (let s = 0; s < 140; s++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 420;
      const sr = Math.random() * 1.2 + 0.2;
      const alpha = 0.4 + Math.random() * 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central purple glow
    const orb = ctx.createRadialGradient(512, 300, 20, 512, 300, 200);
    orb.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
    orb.addColorStop(0.5, 'rgba(80, 40, 180, 0.15)');
    orb.addColorStop(1, 'transparent');
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, 1024, 640);

    // Menu bar
    ctx.fillStyle = 'rgba(10, 10, 20, 0.72)';
    ctx.fillRect(0, 0, 1024, 28);
    ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
    ctx.fillRect(0, 27, 1024, 1);

    // Menu items
    ctx.fillStyle = 'rgba(220, 210, 255, 0.82)';
    ctx.font = '600 12px sans-serif';
    const menuItems = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'];
    let mx = 36;
    menuItems.forEach((item) => {
      ctx.fillText(item, mx, 19);
      mx += ctx.measureText(item).width + 18;
    });

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(220, 210, 255, 0.7)';
    ctx.font = '11px sans-serif';
    ctx.fillText('Mon 9:41 AM', 1010, 19);
    ctx.fillText('100%  WiFi', 870, 19);
    ctx.textAlign = 'left';

    // Dock
    const dockW = 520;
    const dockH = 68;
    const dockX = (1024 - dockW) / 2;
    const dockY = 558;
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'rgba(180, 160, 220, 1)';
    ctx.beginPath();
    ctx.roundRect(dockX, dockY, dockW, dockH, 18);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(180, 150, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(dockX, dockY, dockW, dockH, 18);
    ctx.stroke();
    ctx.restore();

    // Dock icons
    const dockIcons = [
      { color: '#7c3aed', label: '\uD83D\uDD0D' },
      { color: '#6d28d9', label: '\uD83D\uDCDD' },
      { color: '#8b5cf6', label: '\uD83C\uDFB5' },
      { color: '#a78bfa', label: '\uD83D\uDCF7' },
      { color: '#7c3aed', label: '\u2699\uFE0F' },
      { color: '#6d28d9', label: '\uD83C\uDF10' },
    ];
    dockIcons.forEach((ic, idx) => {
      const ix = dockX + 20 + idx * 82;
      const iy = dockY + 8;
      ctx.fillStyle = ic.color;
      ctx.beginPath();
      ctx.roundRect(ix, iy, 52, 52, 12);
      ctx.fill();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ic.label, ix + 26, iy + 36);
      ctx.textAlign = 'left';
    });

    // Desktop icons
    const desktopIcons = [
      { x: 870, y: 50, label: 'Projects' },
      { x: 870, y: 140, label: 'Downloads' },
      { x: 870, y: 230, label: 'Design' },
    ];
    desktopIcons.forEach((di) => {
      ctx.fillStyle = 'rgba(124, 58, 237, 0.85)';
      ctx.beginPath();
      ctx.roundRect(di.x, di.y, 44, 36, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(160, 100, 230, 0.9)';
      ctx.beginPath();
      ctx.roundRect(di.x, di.y - 8, 20, 10, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(220, 210, 255, 0.85)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(di.label, di.x + 22, di.y + 50);
      ctx.textAlign = 'left';
    });

    const screenTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: 0x1a0533,
      emissiveMap: screenTex,
      emissiveIntensity: 1.2,
      roughness: 0,
      metalness: 0,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = Math.PI / 2;
    glowMesh.position.set(0, 0.06, 1.07);
    this.screenGroup.add(glowMesh);
  }

  // ─── ANIMATION ──────────────────────────────────────────────
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.timer.getElapsed();
    this.tick++;

    // 360° slow spin
    this.laptop.rotation.y += 0.004;

    // Gentle float
    this.laptop.position.y = Math.sin(elapsed * 0.6) * 0.04;

    // Lid open/close cycle: 0.15 rad (nearly closed) ↔ 1.45 rad (fully open)
    const lidTarget = -Math.sin(elapsed * 0.15) * 0.65 - 0.8;
    this.screenGroup.rotation.x += (lidTarget - this.screenGroup.rotation.x) * 0.02;

    // Screen light pulse
    this.screenLight.intensity = 0.5 + Math.sin(elapsed * 0.9) * 0.12;

    // ── Typing animation ────────────────────────────────────
    if (this.tick >= this.nextKeyTime) {
      const count = Math.random() < 0.25 ? 2 : 1;
      for (let c = 0; c < count; c++) {
        const key = this.allKeys[Math.floor(Math.random() * this.allKeys.length)];
        if (!this.activeKeyPresses.some((ap) => ap.mesh === key)) {
          this.activeKeyPresses.push({
            mesh: key,
            originalY: key.position.y,
            timer: 0,
            duration: 8 + Math.random() * 6,
            dipDepth: 0.01 + Math.random() * 0.006,
          });
        }
      }
      this.nextKeyTime = this.tick + 4 + Math.floor(Math.random() * 14);
    }

    for (let i = this.activeKeyPresses.length - 1; i >= 0; i--) {
      const ap = this.activeKeyPresses[i];
      ap.timer++;
      const half = ap.duration / 2;
      if (ap.timer <= half) {
        const t = ap.timer / half;
        ap.mesh.position.y = ap.originalY - ap.dipDepth * (t * t);
      } else {
        const t = (ap.timer - half) / half;
        ap.mesh.position.y = ap.originalY - ap.dipDepth * (1 - (1 - t) * (1 - t));
      }
      if (ap.timer >= ap.duration) {
        ap.mesh.position.y = ap.originalY;
        this.activeKeyPresses.splice(i, 1);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.resizeObserver?.disconnect();
  }
}
