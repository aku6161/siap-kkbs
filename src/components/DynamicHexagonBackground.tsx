import React, { useEffect, useRef } from 'react';

interface DynamicHexagonBackgroundProps {
  className?: string;
}

/**
 * Blue Digital Data Lights Technology Background Animation
 * Inspired by 4K dynamic flowing cyber data beams, optical bokeh light spheres, 
 * laser fiber-optic streams, and interactive particle fields.
 */
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    // Mouse & Touch interaction
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      radius: 220,
    };

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

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // --- 1. Laser Data Light Beams (Vertical / Diagonal Fiber Streamlines) ---
    interface DataBeam {
      x: number;
      y: number;
      length: number;
      speed: number;
      width: number;
      alpha: number;
      angle: number; // slight slant for motion dynamics
      color: string;
      headColor: string;
      glowSize: number;
    }

    let beams: DataBeam[] = [];

    const initBeams = () => {
      const beamCount = Math.floor(width / 22); // Dense data stream columns
      beams = Array.from({ length: beamCount }, () => {
        const speed = 180 + Math.random() * 420;
        const length = 80 + Math.random() * 260;
        const isCyan = Math.random() > 0.35;
        return {
          x: Math.random() * (width + 200) - 100,
          y: Math.random() * (height + 400) - 200,
          length,
          speed,
          width: 0.8 + Math.random() * 2.2,
          alpha: 0.25 + Math.random() * 0.65,
          angle: -0.18 + (Math.random() - 0.5) * 0.08, // Dynamic sleek vertical slant
          color: isCyan ? 'rgba(56, 189, 248,' : 'rgba(99, 102, 241,',
          headColor: isCyan ? '#38bdf8' : '#818cf8',
          glowSize: 4 + Math.random() * 12,
        };
      });
    };

    // --- 2. Floating Optical Bokeh Spheres & Data Nodes ---
    interface BokehOrb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseOffset: number;
      pulseSpeed: number;
      color: 'cyan' | 'electric-blue' | 'indigo' | 'white';
    }

    let bokehOrbs: BokehOrb[] = [];

    const initBokeh = () => {
      const bokehCount = Math.max(25, Math.floor(width / 45));
      bokehOrbs = Array.from({ length: bokehCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 6 + Math.random() * 32,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.6,
        alpha: 0.15 + Math.random() * 0.45,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 0.8 + Math.random() * 1.5,
        color: Math.random() > 0.6 ? 'cyan' : Math.random() > 0.3 ? 'electric-blue' : 'indigo',
      }));
    };

    // --- 3. Digital Grid & Constellation Points ---
    interface GridPoint {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      alpha: number;
      size: number;
      pulse: number;
    }

    let gridPoints: GridPoint[] = [];

    const initGridPoints = () => {
      gridPoints = [];
      const spacing = 65;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const gx = c * spacing;
          const gy = r * spacing;
          gridPoints.push({
            x: gx,
            y: gy,
            baseX: gx,
            baseY: gy,
            alpha: 0.04 + Math.random() * 0.08,
            size: 1 + Math.random() * 1.5,
            pulse: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const setupCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      initBeams();
      initBokeh();
      initGridPoints();
    };

    setupCanvas();

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupCanvas, 120);
    };

    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let startTime = performance.now();

    // Main 60fps render loop
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      const elapsed = (currentTime - startTime) * 0.001;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Base Deep Digital Tech Midnight Blue Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#020617');    // Obsidian Dark Blue
      baseGrad.addColorStop(0.35, '#04102c'); // Deep Digital Navy
      baseGrad.addColorStop(0.7, '#07183d');  // Cyber Sapphire
      baseGrad.addColorStop(1, '#020716');    // Base Horizon
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient Glowing Aura Orbs in background
      const aura1X = width * 0.25 + Math.sin(elapsed * 0.4) * 140;
      const aura1Y = height * 0.3 + Math.cos(elapsed * 0.35) * 100;
      const auraGrad1 = ctx.createRadialGradient(aura1X, aura1Y, 10, aura1X, aura1Y, 600);
      auraGrad1.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
      auraGrad1.addColorStop(0.5, 'rgba(2, 132, 199, 0.10)');
      auraGrad1.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = auraGrad1;
      ctx.fillRect(0, 0, width, height);

      const aura2X = width * 0.8 + Math.cos(elapsed * 0.3) * 160;
      const aura2Y = height * 0.75 + Math.sin(elapsed * 0.35) * 120;
      const auraGrad2 = ctx.createRadialGradient(aura2X, aura2Y, 10, aura2X, aura2Y, 650);
      auraGrad2.addColorStop(0, 'rgba(99, 102, 241, 0.20)');
      auraGrad2.addColorStop(0.5, 'rgba(79, 70, 229, 0.08)');
      auraGrad2.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = auraGrad2;
      ctx.fillRect(0, 0, width, height);

      // Set Additive Blending for Laser Light Energy
      ctx.globalCompositeOperation = 'lighter';

      // --- 1. Draw Digital Tech Grid Network ---
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 0.6;
      const pLen = gridPoints.length;
      for (let i = 0; i < pLen; i++) {
        const pt = gridPoints[i];
        const pulse = Math.sin(elapsed * 1.5 + pt.pulse) * 0.5 + 0.5;

        // Interactive mouse distortion
        const distM = Math.hypot(pt.baseX - mouse.x, pt.baseY - mouse.y);
        let glowBoost = 0;
        if (distM < mouse.radius) {
          const factor = (1 - distM / mouse.radius);
          glowBoost = factor * 0.45;
          pt.x = pt.baseX + (pt.baseX - mouse.x) * factor * 0.12;
          pt.y = pt.baseY + (pt.baseY - mouse.y) * factor * 0.12;
        } else {
          pt.x += (pt.baseX - pt.x) * 0.08;
          pt.y += (pt.baseY - pt.y) * 0.08;
        }

        // Draw node points
        const totalAlpha = pt.alpha + pulse * 0.06 + glowBoost;
        ctx.fillStyle = `rgba(56, 189, 248, ${totalAlpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size + (glowBoost > 0 ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. Draw Flowing Laser Data Light Beams ---
      const bLen = beams.length;
      for (let i = 0; i < bLen; i++) {
        const b = beams[i];

        // Move beam upwards/downwards
        b.y -= b.speed * dt;
        b.x += b.speed * Math.sin(b.angle) * dt;

        // Reset when leaving screen
        if (b.y < -b.length - 100) {
          b.y = height + Math.random() * 200;
          b.x = Math.random() * (width + 200) - 100;
        }

        // Mouse proximity boost
        const distM = Math.hypot(b.x - mouse.x, b.y - mouse.y);
        let boost = 1;
        if (distM < mouse.radius) {
          boost = 1 + (1 - distM / mouse.radius) * 1.5;
        }

        const headX = b.x;
        const headY = b.y;
        const tailX = b.x - Math.sin(b.angle) * b.length;
        const tailY = b.y + b.length;

        // Gradient for laser streak
        const beamGrad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        beamGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, b.alpha * boost)})`);
        beamGrad.addColorStop(0.15, `${b.color} ${Math.min(1, b.alpha * boost * 0.85)})`);
        beamGrad.addColorStop(0.7, `${b.color} ${b.alpha * 0.2})`);
        beamGrad.addColorStop(1, `${b.color} 0)`);

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = b.width * boost;
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing Light Head (Optical Data Spark)
        const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, b.glowSize * boost);
        headGlow.addColorStop(0, '#ffffff');
        headGlow.addColorStop(0.3, b.headColor);
        headGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(headX, headY, b.glowSize * boost, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3. Draw Optical Bokeh Spheres (Floating Depth Lights) ---
      const okLen = bokehOrbs.length;
      for (let i = 0; i < okLen; i++) {
        const orb = bokehOrbs[i];

        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.y < -orb.radius * 2) orb.y = height + orb.radius * 2;
        if (orb.x < -orb.radius * 2) orb.x = width + orb.radius * 2;
        if (orb.x > width + orb.radius * 2) orb.x = -orb.radius * 2;

        const pulse = Math.sin(elapsed * orb.pulseSpeed + orb.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = orb.alpha * pulse;

        const bokehGrad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        if (orb.color === 'cyan') {
          bokehGrad.addColorStop(0, `rgba(56, 189, 248, ${currentAlpha * 0.9})`);
          bokehGrad.addColorStop(0.4, `rgba(14, 165, 233, ${currentAlpha * 0.4})`);
          bokehGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        } else if (orb.color === 'electric-blue') {
          bokehGrad.addColorStop(0, `rgba(96, 165, 250, ${currentAlpha * 0.85})`);
          bokehGrad.addColorStop(0.5, `rgba(59, 130, 246, ${currentAlpha * 0.35})`);
          bokehGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          bokehGrad.addColorStop(0, `rgba(167, 139, 250, ${currentAlpha * 0.8})`);
          bokehGrad.addColorStop(0.5, `rgba(139, 92, 246, ${currentAlpha * 0.3})`);
          bokehGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        }

        ctx.fillStyle = bokehGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright nucleus
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, Math.max(1, orb.radius * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 4. Interactive Mouse Data Flare ---
      if (mouse.x > -100 && mouse.y > -100) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        mouseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        mouseGlow.addColorStop(0.2, 'rgba(56, 189, 248, 0.35)');
        mouseGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.12)');
        mouseGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
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
      {/* Cinematic subtle top & bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none" />
    </div>
  );
};
