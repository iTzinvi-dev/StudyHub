import React, { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface GlassBead {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  drift: number;
}

export const RainBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    const drops: Drop[] = [];
    const dropCount = Math.floor(width / 22);
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 14,
        speed: Math.random() * 6 + 7,
        opacity: Math.random() * 0.22 + 0.1
      });
    }

    const glassBeads: GlassBead[] = [];
    for (let i = 0; i < 40; i++) {
      glassBeads.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 1.0,
        alpha: Math.random() * 0.35 + 0.15,
        drift: Math.random() * 0.12 + 0.04
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Glass beads
      for (let i = 0; i < glassBeads.length; i++) {
        const bead = glassBeads[i];
        bead.y += bead.drift;
        if (bead.y > height) {
          bead.y = -5;
          bead.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(bead.x, bead.y, bead.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 204, ${bead.alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bead.x - bead.radius * 0.3, bead.y - bead.radius * 0.3, bead.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
      }

      // Rain streaks
      ctx.lineWidth = 1;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(230, 230, 184, ${d.opacity})`;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1.5, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x -= 0.5;
        if (d.y > height) {
          d.y = -d.length;
          d.x = Math.random() * width + 40;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* High-Resolution Cinematic Rainy Pine Window Photograph */}
      <img
        src="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85"
        alt="Rainy window overlooking pines"
        className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
      />

      {/* Atmospheric Cozy Dark Olive & Lamp Glow Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#101306]/80 via-[#161908]/75 to-[#0D1005]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(255,215,0,0.12),transparent_65%)]" />

      {/* Procedural Water Droplet Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
