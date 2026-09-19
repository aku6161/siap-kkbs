import React, { useEffect, useRef } from 'react';

interface DynamicHexagonBackgroundProps {
  className?: string;
}

/**
 * Beautiful Particles with Shallow Depth of Field (DoF) - Loopable Blue Version
 * Multi-layer 3D optical bokeh particle field, organic fluid floating physics,
 * luminous stardust motes, soft out-of-focus bokeh discs, and gentle interactive ripple.
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
      radius: 200,
      vx: 0,
      vy: 0,
      prevX: -2000,
      prevY: -2000,
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

    // Particle representation in 3D Depth Field
    interface Particle {
      x: number;
      y: number;
      z: number; // 0 (far background) to 1 (close foreground with heavy bokeh)
      baseRadius: number;
      vx: number;
      vy: number;
      flowOffset: number;
      flowSpeed: number;
      pulseOffset: number;
      pulseSpeed: number;
      baseAlpha: number;
      colorType: 'cyan' | 'electric-blue' | 'sky-white' | 'deep-sapphire';
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      // Particle density tailored to screen size
      const count = Math.max(90, Math.floor((width * height) / 9500));
      particles = Array.from({ length: count }, () => {
        // Z-Depth distribution (more medium/deep particles, fewer huge foreground bokeh)
        const z = Math.pow(Math.random(), 1.6);
        const isForegroundBokeh = z > 0.78;

        let colorType: 'cyan' | 'electric-blue' | 'sky-white' | 'deep-sapphire';
        const randColor = Math.random();
        if (randColor > 0.65) colorType = 'cyan';
        else if (randColor > 0.35) colorType = 'electric-blue';
        else if (randColor > 0.15) colorType = 'sky-white';
        else colorType = 'deep-sapphire';

        // Radius scaling by Z-depth
        let baseRadius: number;
        let baseAlpha: number;

        if (isForegroundBokeh) {
          // Large blurry out-of-focus foreground bokeh orbs
          baseRadius = 24 + (z - 0.78) * 160; // 24px - 58px
          baseAlpha = 0.08 + Math.random() * 0.18; // soft translucent
        } else if (z > 0.35) {
          // In-focus luminous midground sparks
          baseRadius = 2.5 + z * 5.5; // 3.5px - 7px
          baseAlpha = 0.35 + Math.random() * 0.55;
        } else {
          // Deep field pinpoint stardust motes
          baseRadius = 0.8 + z * 2.5; // 0.8px - 1.8px
          baseAlpha = 0.15 + Math.random() * 0.35;
        }

        return {
          x: Math.random() * (width + 120) - 60,
          y: Math.random() * (height + 120) - 60,
          z,
          baseRadius,
          vx: (Math.random() - 0.5) * (0.2 + z * 0.3),
          vy: -0.15 - Math.random() * (0.25 + z * 0.45), // Gentle upward/ambient drift
          flowOffset: Math.random() * Math.PI * 2,
          flowSpeed: 0.3 + Math.random() * 0.7,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.8 + Math.random() * 1.6,
          baseAlpha,
          colorType,
        };
      });

      // Sort by Z so background renders first, foreground bokeh renders on top
      particles.sort((a, b) => a.z - b.z);
    };

    initParticles();

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 120);
    };

    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let startTime = performance.now();

    // Render 60 FPS Loop
    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) * 0.001, 0.1);
      lastTime = currentTime;
      const elapsed = (currentTime - startTime) * 0.001;

      // Smooth mouse lerp & velocity
      const prevMx = mouse.x;
      const prevMy = mouse.y;
      mouse.x += (mouse.targetX - mouse.x) * 0.09;
      mouse.y += (mouse.targetY - mouse.y) * 0.09;
      mouse.vx = mouse.x - prevMx;
      mouse.vy = mouse.y - prevMy;

      // 1. Deep Celestial Blue Background Gradient (Inspired by Blue Shallow DoF reference)
      const bgGrad = ctx.createLinearGradient(0, 0, width * 0.7, height);
      bgGrad.addColorStop(0, '#010614');    // Deepest midnight obsidian
      bgGrad.addColorStop(0.3, '#030e26');  // Rich cosmic blue
      bgGrad.addColorStop(0.65, '#05183f'); // Radiant dark sapphire
      bgGrad.addColorStop(1, '#02091a');    // Deep base
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Ambient Deep Radial Blue Glows (Atmospheric lighting)
      const aura1X = width * 0.3 + Math.sin(elapsed * 0.25) * 120;
      const aura1Y = height * 0.35 + Math.cos(elapsed * 0.2) * 90;
      const auraGrad1 = ctx.createRadialGradient(aura1X, aura1Y, 20, aura1X, aura1Y, 650);
      auraGrad1.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
      auraGrad1.addColorStop(0.5, 'rgba(2, 132, 199, 0.07)');
      auraGrad1.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = auraGrad1;
      ctx.fillRect(0, 0, width, height);

      const aura2X = width * 0.75 + Math.cos(elapsed * 0.22) * 140;
      const aura2Y = height * 0.7 + Math.sin(elapsed * 0.28) * 110;
      const auraGrad2 = ctx.createRadialGradient(aura2X, aura2Y, 20, aura2X, aura2Y, 700);
      auraGrad2.addColorStop(0, 'rgba(59, 130, 246, 0.16)');
      auraGrad2.addColorStop(0.5, 'rgba(37, 99, 235, 0.06)');
      auraGrad2.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = auraGrad2;
      ctx.fillRect(0, 0, width, height);

      // Use Additive Blending ('lighter') for luminous bokeh & particle bloom
      ctx.globalCompositeOperation = 'lighter';

      // 3. Render and animate particle field
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Harmonic fluid wave drift
        const waveX = Math.sin(elapsed * p.flowSpeed + p.flowOffset + p.y * 0.004) * (0.6 + p.z * 1.2);
        const waveY = Math.cos(elapsed * (p.flowSpeed * 0.8) + p.flowOffset + p.x * 0.004) * (0.3 + p.z * 0.8);

        p.x += (p.vx + waveX) * (60 * dt);
        p.y += (p.vy + waveY) * (60 * dt);

        // Gentle interactive mouse swirl / repulsion
        const distM = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (distM < mouse.radius && mouse.x > -100) {
          const force = (1 - distM / mouse.radius) * (0.8 + p.z * 1.5);
          const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
          p.x += Math.cos(angle) * force * 3.5;
          p.y += Math.sin(angle) * force * 3.5;
        }

        // Screen boundary wrapping (seamless infinite loop)
        const margin = p.baseRadius + 40;
        if (p.y < -margin) {
          p.y = height + margin;
          p.x = Math.random() * (width + 80) - 40;
        }
        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y > height + margin) p.y = -margin;

        // Dynamic pulsing shimmer
        const pulse = Math.sin(elapsed * p.pulseSpeed + p.pulseOffset) * 0.25 + 0.75;
        const alpha = Math.min(1, p.baseAlpha * pulse);

        const r = p.baseRadius;

        // Draw Particle by Type:
        if (p.z > 0.78) {
          // --- SHALLOW DEPTH OF FIELD: Large, blurry translucent bokeh disks ---
          const bokehGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          if (p.colorType === 'cyan') {
            bokehGrad.addColorStop(0, `rgba(56, 189, 248, ${alpha * 0.6})`);
            bokehGrad.addColorStop(0.5, `rgba(14, 165, 233, ${alpha * 0.25})`);
            bokehGrad.addColorStop(0.85, `rgba(2, 132, 199, ${alpha * 0.1})`);
            bokehGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
          } else if (p.colorType === 'electric-blue') {
            bokehGrad.addColorStop(0, `rgba(96, 165, 250, ${alpha * 0.55})`);
            bokehGrad.addColorStop(0.5, `rgba(59, 130, 246, ${alpha * 0.22})`);
            bokehGrad.addColorStop(0.85, `rgba(37, 99, 235, ${alpha * 0.08})`);
            bokehGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
          } else {
            bokehGrad.addColorStop(0, `rgba(224, 242, 254, ${alpha * 0.7})`);
            bokehGrad.addColorStop(0.45, `rgba(56, 189, 248, ${alpha * 0.28})`);
            bokehGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          }

          ctx.fillStyle = bokehGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Soft subtle optical ring border on out-of-focus lenses
          ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.12})`;
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (p.z > 0.35) {
          // --- IN-FOCUS MIDGROUND: Crisp glowing sparks with radial halo ---
          const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
          haloGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          haloGrad.addColorStop(0.25, `rgba(56, 189, 248, ${alpha * 0.8})`);
          haloGrad.addColorStop(0.65, `rgba(14, 165, 233, ${alpha * 0.25})`);
          haloGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright center starlet point
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.4)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.8, r * 0.4), 0, Math.PI * 2);
          ctx.fill();

        } else {
          // --- DEEP BACKGROUND: Tiny shimmering stardust motes ---
          ctx.fillStyle = p.colorType === 'cyan' 
            ? `rgba(56, 189, 248, ${alpha * 0.9})`
            : `rgba(147, 197, 253, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Subtle Interactive Mouse Light Glow
      if (mouse.x > -100 && mouse.y > -100) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        mouseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        mouseGlow.addColorStop(0.2, 'rgba(56, 189, 248, 0.28)');
        mouseGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
        mouseGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
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
      {/* Subtle cinematic top and bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/35 pointer-events-none" />
    </div>
  );
};
