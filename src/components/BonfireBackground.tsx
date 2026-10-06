import React, { useEffect, useRef } from 'react';

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
}

export const BonfireBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    const embers: Ember[] = [];
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Coordinated with the medium-distance campfire logs
      const fireBaseX = width / 2;
      const fireBaseY = height * 0.74;

      // Spawn rising glowing sparks & embers
      if (Math.random() < 0.65) {
        embers.push({
          x: fireBaseX + (Math.random() - 0.5) * 260,
          y: fireBaseY + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 2.8 + 1.6),
          size: Math.random() * 2.6 + 1.1,
          alpha: 1,
          decay: Math.random() * 0.011 + 0.006
        });
      }

      // Draw embers with glowing bokeh blur
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(tick * 0.035 + i) * 0.75;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.alpha <= 0 || e.y < 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(175 + Math.random() * 60)}, 25, ${e.alpha})`;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 9;
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

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#060402] ${className}`}>
      {/* 1. Medium-Distance High-Quality WebM Campfire Video (Logs at base, flame aligned with timer) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/videos/zen-bonfire-poster.jpg"
        className="w-full h-full object-cover object-bottom brightness-[0.88] contrast-[1.08] transition-transform duration-1000"
      >
        <source src="/videos/zen-bonfire.webm" type="video/webm" />
        {/* Fallback image */}
        <img
          src="/videos/zen-bonfire-poster.jpg"
          alt="Cozy burning bonfire logs and flame"
          className="w-full h-full object-cover object-bottom"
        />
      </video>

      {/* 2. Soft Ambient Hearth Glow behind the Focus Timer Circle */}
      <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[520px] h-[420px] sm:h-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,145,25,0.32)_0%,rgba(255,95,10,0.12)_42%,transparent_72%)] animate-pulse pointer-events-none filter blur-2xl" />

      {/* 3. Deep Atmospheric Night Vignettes preserving 'Golden Zenith' Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,4,2,0.6)_65%,rgba(4,2,1,0.94)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060402] via-transparent to-[#060402]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060402]/60 via-transparent to-[#060402]/60 pointer-events-none" />

      {/* 4. Canvas of Floating Luminous Sparks & Embers */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
};
