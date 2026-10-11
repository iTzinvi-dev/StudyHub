import React, { useEffect, useRef } from 'react';

interface Droplet {
  x: number;
  y: number;
  radius: number;
  speed: number;
  trailLength: number;
  alpha: number;
  wobble: number;
}

interface RainStreak {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

export const MainLoungeBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

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

    // Outside rain streaks falling in the afternoon mist
    const streaks: RainStreak[] = [];
    const streakCount = Math.floor(width / 22);
    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7, // Rain in the window area
        speed: Math.random() * 8 + 9,
        length: Math.random() * 24 + 14,
        opacity: Math.random() * 0.18 + 0.08
      });
    }

    // Condensation and sliding rivulets on forward window pane
    const droplets: Droplet[] = [];
    const dropletCount = 55;
    for (let i = 0; i < dropletCount; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        radius: Math.random() * 2.4 + 1.1,
        speed: Math.random() < 0.25 ? Math.random() * 1.6 + 0.6 : Math.random() * 0.14 + 0.02,
        trailLength: Math.random() * 28 + 12,
        alpha: Math.random() * 0.42 + 0.22,
        wobble: Math.random() * Math.PI * 2
      });
    }

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Outside falling afternoon rain
      ctx.lineWidth = 1;
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(225, 238, 225, ${s.opacity})`;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - 1, s.y + s.length);
        ctx.stroke();

        s.y += s.speed;
        s.x -= 0.4;
        if (s.y > height * 0.72) {
          s.y = -s.length;
          s.x = Math.random() * width + 40;
        }
      }

      // 2. Sliding window rivulets & water beads
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        d.y += d.speed;
        d.wobble += 0.025;

        // Faint water rivulet trail behind sliding droplets
        if (d.speed > 0.35) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(240, 250, 240, ${d.alpha * 0.28})`;
          ctx.lineWidth = d.radius * 0.65;
          ctx.moveTo(d.x, d.y - d.trailLength);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }

        // Droplet body
        ctx.beginPath();
        ctx.arc(d.x + Math.sin(d.wobble) * 0.3, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 252, 245, ${d.alpha})`;
        ctx.fill();

        // Droplet specular glint (warm amber glint on the left from the desk lamp)
        ctx.beginPath();
        ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = d.x < width * 0.45 ? 'rgba(255, 220, 150, 0.85)' : 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        if (d.y > height * 0.72) {
          d.y = -10;
          d.x = Math.random() * width;
          d.speed = Math.random() < 0.25 ? Math.random() * 1.6 + 0.6 : Math.random() * 0.14 + 0.02;
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
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#0B0F0B] ${className}`}>
      {/* 1. True WebM Video of Study Table with Forward Rainy Window and Left Desk Lamp */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/videos/study-rain-lamp-poster.jpg"
        className="w-full h-full object-cover object-center scale-[1.02] brightness-[0.82] contrast-[1.08] transition-transform duration-1000"
      >
        <source src="/videos/study-rain-lamp.webm" type="video/webm" />
        {/* Fallback image */}
        <img
          src="/videos/study-rain-lamp-poster.jpg"
          alt="Study table with rainy window and left lamp"
          className="w-full h-full object-cover"
        />
      </video>

      {/* 2. Left Hand Side: Animated Warm Desk Lamp Glowing Atmosphere */}
      <div className="absolute top-[48%] left-[10%] sm:left-[14%] -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none">
        {/* Soft breathing amber ambient light cone illuminating the study desk */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,185,50,0.48)_0%,rgba(255,140,25,0.22)_40%,transparent_72%)] animate-pulse" />

        {/* Vintage Desk Lamp Shade Silhouette & Core Amber Hearth Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-14 rounded-t-xl bg-gradient-to-b from-[#FFBA38] to-[#D97706] shadow-[0_0_50px_rgba(255,190,60,0.85)] opacity-95" />
        <div className="absolute top-[62%] left-1/2 -translate-x-1/2 w-2 h-20 bg-[#161D15] rounded-full shadow-md" />
        <div className="absolute top-[92%] left-1/2 -translate-x-1/2 w-14 h-4 bg-[#111710] rounded-full border-t border-[#FFAE33]/40 shadow-lg" />
      </div>

      {/* 3. Forward Rainy Window & Study Desk Atmospheric Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070B07]/80 via-transparent to-[#070B07]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060A06]/95 via-[#0D140D]/55 to-[#080D08]/65 pointer-events-none" />

      {/* 4. Study Table Sill at the Bottom (Books & Notebook Area) */}
      <div className="absolute bottom-0 inset-x-0 h-44 sm:h-56 bg-gradient-to-t from-[#060A06] via-[#0C120C]/90 to-transparent pointer-events-none">
        {/* Book stack silhouette on the study desk */}
        <div className="hidden sm:block absolute bottom-8 left-[24%] w-36 h-14 rounded-sm bg-[#161F16]/85 border-t border-l border-[#FFAE33]/20 shadow-2xl">
          <div className="absolute -top-3 left-2 w-32 h-4 rounded-sm bg-[#8B2626]/80 border-t border-[#FFD700]/25" />
        </div>
      </div>

      {/* 5. Procedural Rain Streaks & Water Droplets Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
