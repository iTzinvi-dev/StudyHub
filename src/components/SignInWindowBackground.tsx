import React, { useEffect, useRef } from 'react';

interface Droplet {
  x: number;
  y: number;
  radius: number;
  speed: number;
  trailLength: number;
  alpha: number;
}

interface RainStreak {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

export const SignInWindowBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    // Falling rain in background behind window
    const streaks: RainStreak[] = [];
    const streakCount = Math.floor(width / 18);
    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 8 + 10,
        length: Math.random() * 26 + 18,
        opacity: Math.random() * 0.18 + 0.08
      });
    }

    // Dynamic trickling droplets on the glass pane
    const droplets: Droplet[] = [];
    const dropletCount = 45;
    for (let i = 0; i < dropletCount; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.4 + 1.2,
        speed: Math.random() < 0.25 ? Math.random() * 1.5 + 0.8 : Math.random() * 0.15 + 0.02,
        trailLength: Math.random() * 30 + 15,
        alpha: Math.random() * 0.45 + 0.25
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw falling rain streaks
      ctx.lineWidth = 1;
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(220, 235, 220, ${s.opacity})`;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - 1.2, s.y + s.length);
        ctx.stroke();

        s.y += s.speed;
        s.x -= 0.4;
        if (s.y > height) {
          s.y = -s.length;
          s.x = Math.random() * width + 50;
        }
      }

      // 2. Draw trickling water droplets and glass beads
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        d.y += d.speed;

        // If it's a moving droplet, occasionally draw a faint water rivulet trail
        if (d.speed > 0.4) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(235, 245, 235, ${d.alpha * 0.3})`;
          ctx.lineWidth = d.radius * 0.7;
          ctx.moveTo(d.x, d.y - d.trailLength);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }

        // Droplet body
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 248, 240, ${d.alpha})`;
        ctx.fill();

        // Droplet specular glint
        ctx.beginPath();
        ctx.arc(d.x - d.radius * 0.35, d.y - d.radius * 0.35, d.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        if (d.y > height) {
          d.y = -10;
          d.x = Math.random() * width;
          d.speed = Math.random() < 0.25 ? Math.random() * 1.5 + 0.8 : Math.random() * 0.15 + 0.02;
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
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* High-Resolution Deep Moody Pine Forest Rain Window Photo */}
      <img
        src="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2400&q=85"
        alt="Rainy window overlooking dark pines"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03] transition-transform duration-1000 ease-out"
      />

      {/* Atmospheric Dark Forest Color Grading & Fog Tints */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A100B]/85 via-[#111A13]/70 to-[#070D08]/95" />

      {/* Distant Cabin Hearth / Warm Lantern Light in the Woods (breathing animation) */}
      <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(255,170,40,0.45)_0%,rgba(255,130,20,0.18)_40%,transparent_70%)] animate-pulse pointer-events-none filter blur-sm" />

      {/* Architectural Window Casement Silhouette Borders (matching the open window in user's image) */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#070B08] via-[#0D150F] to-transparent pointer-events-none border-r border-[#1B291E]/30" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#070B08] via-[#0D150F] to-transparent pointer-events-none border-l border-[#1B291E]/30" />
      <div className="absolute top-0 inset-x-0 h-10 sm:h-14 bg-gradient-to-b from-[#070B08] to-transparent pointer-events-none border-b border-[#1B291E]/20" />
      <div className="absolute bottom-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-t from-[#060A07] via-[#0A110B] to-transparent pointer-events-none" />

      {/* Delicate Window Latch Silhouette (Left Edge) */}
      <div className="hidden sm:block absolute top-[44%] left-6 w-3 h-10 rounded-r-md bg-[#1B261E] border-r border-t border-b border-[#FFD700]/15 shadow-lg" />

      {/* Procedural Water Rivulets & Rain Droplets Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
