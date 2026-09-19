import React, { useEffect, useRef } from 'react';

interface DynamicHexagonBackgroundProps {
  className?: string;
}

export const DynamicHexagonBackground: React.FC<DynamicHexagonBackgroundProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    let width = 0;
    let height = 0;

    // Mouse & Touch interaction
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      radius: 170,
    };

    // Click/Tap ripples
    interface Shockwave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      alpha: number;
      colorType: number;
    }
    const shockwaves: Shockwave[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      shockwaves.push({
        x: clientX,
        y: clientY,
        radius: 10,
        maxRadius: 420,
        speed: 380, // px/s
        alpha: 1.0,
        colorType: Math.floor(Math.random() * 4),
      });
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Hexagon geometric layout
    const hexRadius = 38; // Radius of each hexagon
    const hexHeight = hexRadius * 2;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const vertDist = hexHeight * 0.75;
    const horizDist = hexWidth;

    interface HexCell {
      x: number;
      y: number;
      col: number;
      row: number;
      baseAlpha: number;
      pulseOffset: number;
      pulseSpeed: number;
      colorType: number; // 0: cyan, 1: blue, 2: purple, 3: emerald
    }

    let hexGrid: HexCell[] = [];

    const setupCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      hexGrid = [];
      const cols = Math.ceil(width / horizDist) + 2;
      const rows = Math.ceil(height / vertDist) + 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const xOffset = r % 2 === 0 ? 0 : horizDist / 2;
          const x = c * horizDist + xOffset;
          const y = r * vertDist;

          hexGrid.push({
            x,
            y,
            col: c,
            row: r,
            baseAlpha: 0.04 + (Math.sin(c * 0.4) * Math.cos(r * 0.4) * 0.5 + 0.5) * 0.05,
            pulseOffset: Math.random() * Math.PI * 2,
            pulseSpeed: 0.6 + Math.random() * 0.8,
            colorType: (c + r * 2) % 4 < 0 ? 0 : (c + r * 2) % 4,
          });
        }
      }
    };

    setupCanvasSize();

    let resizeTimeout: any;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupCanvasSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Floating Particles for cyber/motion depth
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      phase: number;
    }

    const particles: Particle[] = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.3,
      size: 1 + Math.random() * 2.2,
      alpha: 0.2 + Math.random() * 0.5,
      color: Math.random() > 0.4 ? '#38bdf8' : '#a78bfa',
      phase: Math.random() * Math.PI * 2,
    }));

    // Draw Hexagon Helper
    const drawHexagon = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      rotation: number = 0
    ) => {
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6 + rotation;
        const hx = cx + radius * Math.cos(angle);
        const hy = cy + radius * Math.sin(angle);
        if (i === 0) {
          context.moveTo(hx, hy);
        } else {
          context.lineTo(hx, hy);
        }
      }
      context.closePath();
    };

    // Color definitions
    const colors = [
      { r: 6, g: 182, b: 212, name: 'cyan' },     // Cyan #06b6d4
      { r: 59, g: 130, b: 246, name: 'blue' },    // Royal Blue #3b82f6
      { r: 139, g: 92, b: 246, name: 'violet' },  // Electric Violet #8b5cf6
      { r: 16, g: 185, b: 129, name: 'emerald' }, // Emerald #10b981
    ];

    let lastTime = performance.now();
    let startTime = performance.now();

    // Render loop
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      const elapsed = (currentTime - startTime) * 0.001;

      // Mouse smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Update shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed * dt;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        if (sw.radius >= sw.maxRadius) {
          shockwaves.splice(s, 1);
        }
      }

      // Base Canvas Clearing with Deep Navy / Cosmic Slate Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#050914');    // Deep cyber navy
      bgGrad.addColorStop(0.35, '#0a1226'); // Rich tech sapphire
      bgGrad.addColorStop(0.7, '#0e162e');  // Modern indigo-tinted slate
      bgGrad.addColorStop(1, '#060a15');    // Base dark
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient dynamic glowing aura orbs in background
      const orb1X = width * 0.18 + Math.sin(elapsed * 0.4) * 100;
      const orb1Y = height * 0.25 + Math.cos(elapsed * 0.35) * 80;
      const orbGrad1 = ctx.createRadialGradient(orb1X, orb1Y, 20, orb1X, orb1Y, 520);
      orbGrad1.addColorStop(0, 'rgba(6, 182, 212, 0.14)');
      orbGrad1.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = orbGrad1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.82 + Math.cos(elapsed * 0.4) * 120;
      const orb2Y = height * 0.7 + Math.sin(elapsed * 0.3) * 90;
      const orbGrad2 = ctx.createRadialGradient(orb2X, orb2Y, 20, orb2X, orb2Y, 560);
      orbGrad2.addColorStop(0, 'rgba(139, 92, 246, 0.13)');
      orbGrad2.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = orbGrad2;
      ctx.fillRect(0, 0, width, height);

      // --- Wave Mask Transitions (Inspired by 4K Hexagon Transition Motion Graphics) ---
      const totalDiagonal = Math.sqrt(width * width + height * height) + 900;

      // 1. Primary sweeping diagonal transition wave
      const waveSpeed1 = 320;
      const wavePos1 = (elapsed * waveSpeed1) % (totalDiagonal + 700) - 350;
      const waveWidth1 = 300;

      // 2. Secondary counter-sweeping wave
      const waveSpeed2 = 260;
      const wavePos2 = (elapsed * waveSpeed2 + 600) % (totalDiagonal + 700) - 350;
      const waveWidth2 = 340;

      // 3. Periodic horizontal tech pulse
      const hPulsePos = (elapsed * 240) % (width + 600) - 300;
      const hPulseWidth = 240;

      const gridLen = hexGrid.length;
      for (let i = 0; i < gridLen; i++) {
        const hex = hexGrid[i];

        // Wave 1: Top-Left to Bottom-Right (45 deg)
        const diagDist1 = (hex.x + hex.y) * 0.7071;
        const distToW1 = Math.abs(diagDist1 - wavePos1);
        let wave1 = 0;
        if (distToW1 < waveWidth1) {
          wave1 = Math.cos((distToW1 / waveWidth1) * (Math.PI / 2));
          wave1 = Math.pow(wave1, 2.2);
        }

        // Wave 2: Bottom-Right to Top-Left
        const diagDist2 = (totalDiagonal * 0.7071) - (hex.x * 0.75 + hex.y * 0.65);
        const distToW2 = Math.abs(diagDist2 - wavePos2);
        let wave2 = 0;
        if (distToW2 < waveWidth2) {
          wave2 = Math.cos((distToW2 / waveWidth2) * (Math.PI / 2));
          wave2 = Math.pow(wave2, 2.5);
        }

        // Horizontal Pulse
        const distToHPulse = Math.abs(hex.x - hPulsePos);
        let hPulse = 0;
        if (distToHPulse < hPulseWidth) {
          hPulse = Math.cos((distToHPulse / hPulseWidth) * (Math.PI / 2)) * 0.4;
        }

        // Ambient gentle shimmer
        const ambientPulse = Math.sin(elapsed * hex.pulseSpeed + hex.pulseOffset) * 0.5 + 0.5;

        // Interactive Mouse Glow
        const distToMouse = Math.hypot(hex.x - mouse.x, hex.y - mouse.y);
        let mouseIntensity = 0;
        if (distToMouse < mouse.radius) {
          mouseIntensity = Math.pow(1 - distToMouse / mouse.radius, 1.8);
        }

        // Shockwaves from clicks
        let shockwaveIntensity = 0;
        for (let sw of shockwaves) {
          const distToSW = Math.hypot(hex.x - sw.x, hex.y - sw.y);
          const diff = Math.abs(distToSW - sw.radius);
          if (diff < 90) {
            const factor = Math.cos((diff / 90) * (Math.PI / 2)) * sw.alpha;
            shockwaveIntensity = Math.max(shockwaveIntensity, factor * 1.3);
          }
        }

        // Combined activity level
        const totalActivity = Math.min(
          1.6,
          wave1 * 1.1 + wave2 * 0.8 + hPulse + mouseIntensity * 1.3 + shockwaveIntensity * 1.5 + ambientPulse * 0.12
        );

        const c = colors[hex.colorType];

        // 1. Base subtle hexagon wireframe
        const baseAlpha = hex.baseAlpha * 0.75 + ambientPulse * 0.03;
        ctx.strokeStyle = `rgba(148, 163, 184, ${baseAlpha})`;
        ctx.lineWidth = 0.75;
        drawHexagon(ctx, hex.x, hex.y, hexRadius - 2.5);
        ctx.stroke();

        // 2. Dynamic Hexagon Activation & Transition Mask Lighting
        if (totalActivity > 0.04) {
          const actAlpha = Math.min(1, totalActivity);

          // Fill with glowing cyber gradient color
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${actAlpha * 0.24})`;
          drawHexagon(ctx, hex.x, hex.y, hexRadius - 3);
          ctx.fill();

          // Outer glowing border
          const strokeR = Math.min(255, c.r + 90);
          const strokeG = Math.min(255, c.g + 90);
          const strokeB = Math.min(255, c.b + 90);
          ctx.strokeStyle = `rgba(${strokeR}, ${strokeG}, ${strokeB}, ${actAlpha * 0.9})`;
          ctx.lineWidth = 1.0 + totalActivity * 1.8;
          ctx.shadowColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
          ctx.shadowBlur = totalActivity * 18;
          drawHexagon(ctx, hex.x, hex.y, hexRadius - 2.5);
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset

          // Inner Concentric Hexagon Layer on higher intensity
          if (totalActivity > 0.4) {
            const innerRadius = (hexRadius - 3) * (0.45 + 0.15 * Math.sin(elapsed * 2.5 + hex.pulseOffset));
            ctx.strokeStyle = `rgba(255, 255, 255, ${(totalActivity - 0.35) * 0.85})`;
            ctx.lineWidth = 1;
            drawHexagon(ctx, hex.x, hex.y, innerRadius);
            ctx.stroke();

            // Center tech micro-dot
            ctx.fillStyle = `rgba(255, 255, 255, ${(totalActivity - 0.35) * 0.95})`;
            ctx.beginPath();
            ctx.arc(hex.x, hex.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Floating Ambient Cyber Particles
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(elapsed * 2 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Subtle overlay vignette for visual elegance */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none" />
    </div>
  );
};
