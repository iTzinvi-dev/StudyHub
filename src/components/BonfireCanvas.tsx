import React, { useEffect, useRef } from 'react';

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

export const BonfireCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const flames: FlameParticle[] = [];
    const embers: Ember[] = [];

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep dark night forest backdrop
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.65,
        50,
        width / 2,
        height * 0.65,
        width * 0.75
      );
      bgGrad.addColorStop(0, '#221502');
      bgGrad.addColorStop(0.4, '#130C02');
      bgGrad.addColorStop(1, '#080501');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const fireBaseX = width / 2;
      const fireBaseY = height * 0.72;

      // Dynamic bonfire hearth glow
      const flicker = Math.sin(tick * 0.1) * 15 + Math.cos(tick * 0.17) * 10;
      const glowGrad = ctx.createRadialGradient(
        fireBaseX,
        fireBaseY - 60,
        20,
        fireBaseX,
        fireBaseY - 60,
        320 + flicker
      );
      glowGrad.addColorStop(0, 'rgba(255, 170, 0, 0.35)');
      glowGrad.addColorStop(0.4, 'rgba(255, 90, 0, 0.18)');
      glowGrad.addColorStop(0.8, 'rgba(180, 50, 0, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Spawn new flame particles
      for (let i = 0; i < 4; i++) {
        flames.push({
          x: fireBaseX + (Math.random() - 0.5) * 80,
          y: fireBaseY + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -(Math.random() * 3.5 + 3.2),
          radius: Math.random() * 24 + 18,
          life: 0,
          maxLife: Math.random() * 25 + 28,
          hue: Math.random() * 25 + 35 // golden to amber hues (35 to 60)
        });
      }

      // Draw flames with additive blend
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = flames.length - 1; i >= 0; i--) {
        const f = flames[i];
        f.life++;
        f.x += f.vx;
        f.y += f.vy;
        f.radius *= 0.96;

        const progress = f.life / f.maxLife;
        if (progress >= 1 || f.radius < 2) {
          flames.splice(i, 1);
          continue;
        }

        const alpha = Math.sin(progress * Math.PI) * 0.65;
        const color = progress < 0.3
          ? `rgba(255, 255, 204, ${alpha})`
          : progress < 0.65
          ? `rgba(255, 215, 0, ${alpha * 0.9})`
          : `rgba(255, 100, 10, ${alpha * 0.7})`;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.restore();

      // Draw rustic campfire logs
      ctx.save();
      // Left log
      ctx.beginPath();
      ctx.translate(fireBaseX - 70, fireBaseY + 15);
      ctx.rotate(-0.25);
      ctx.fillStyle = '#2A1808';
      ctx.roundRect(-50, -12, 120, 24, 6);
      ctx.fill();
      // Glowing ember streak on log
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 160, 20, 0.7)';
      ctx.lineWidth = 3;
      ctx.moveTo(-20, 0);
      ctx.lineTo(40, -2);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Right log
      ctx.beginPath();
      ctx.translate(fireBaseX + 70, fireBaseY + 15);
      ctx.rotate(0.28);
      ctx.fillStyle = '#221306';
      ctx.roundRect(-70, -12, 120, 24, 6);
      ctx.fill();
      // Glowing ember streak on right log
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 120, 0, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.moveTo(-35, 2);
      ctx.lineTo(25, -1);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Center cross log
      ctx.beginPath();
      ctx.fillStyle = '#1A0E04';
      ctx.roundRect(fireBaseX - 60, fireBaseY + 6, 120, 20, 5);
      ctx.fill();
      ctx.restore();

      // Spawn rising embers
      if (Math.random() < 0.45) {
        embers.push({
          x: fireBaseX + (Math.random() - 0.5) * 110,
          y: fireBaseY - 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 2.5 + 1.5),
          size: Math.random() * 2.5 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.012 + 0.008
        });
      }

      // Draw embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(tick * 0.05 + i) * 0.5;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.alpha <= 0 || e.y < 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(180 + Math.random() * 60)}, 0, ${e.alpha})`;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none z-0 ${className}`} />;
};
