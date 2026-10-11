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

interface StudyTableBackgroundProps {
  className?: string;
  darkness?: 'subtle' | 'normal' | 'deep';
  showLamp?: boolean;
}

export const StudyTableBackground: React.FC<StudyTableBackgroundProps> = ({
  className = '',
  darkness = 'normal',
  showLamp = true
}) => {
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

    // Outside rain streaks falling in the dusk through the upper window pane
    const streaks: RainStreak[] = [];
    const streakCount = Math.min(22, Math.floor(width / 45));
    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.48,
        speed: Math.random() * 6 + 8,
        length: Math.random() * 18 + 10,
        opacity: Math.random() * 0.14 + 0.06
      });
    }

    // Condensation and sliding rivulets on the window pane above desk sill
    const droplets: Droplet[] = [];
    const dropletCount = 18;
    for (let i = 0; i < dropletCount; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.47,
        radius: Math.random() * 1.8 + 0.9,
        speed: Math.random() < 0.25 ? Math.random() * 1.2 + 0.4 : Math.random() * 0.1 + 0.02,
        trailLength: Math.random() * 20 + 8,
        alpha: Math.random() * 0.32 + 0.14,
        wobble: Math.random() * Math.PI * 2
      });
    }

    let lastFrameTime = 0;
    const render = (time: number) => {
      // Pause drawing when tab is hidden or throttle to 30fps to avoid burning GPU
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      if (time - lastFrameTime < 32) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Outside falling rain streaks
      ctx.lineWidth = 1;
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(225, 238, 225, ${s.opacity})`;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - 1, s.y + s.length);
        ctx.stroke();

        s.y += s.speed;
        s.x -= 0.35;
        if (s.y > height * 0.48) {
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
        if (d.speed > 0.3) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(240, 250, 240, ${d.alpha * 0.25})`;
          ctx.lineWidth = d.radius * 0.6;
          ctx.moveTo(d.x, d.y - d.trailLength);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }

        // Droplet body
        ctx.beginPath();
        ctx.arc(d.x + Math.sin(d.wobble) * 0.3, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 252, 245, ${d.alpha})`;
        ctx.fill();

        // Droplet specular glint (warm amber glint towards the right from the lamp)
        ctx.beginPath();
        ctx.arc(d.x - d.radius * 0.3, d.y - d.radius * 0.3, d.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = d.x > width * 0.55 ? 'rgba(255, 215, 140, 0.85)' : 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        if (d.y > height * 0.48) {
          d.y = -10;
          d.x = Math.random() * width;
          d.speed = Math.random() < 0.25 ? Math.random() * 1.2 + 0.4 : Math.random() * 0.1 + 0.02;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const overlayOpacity =
    darkness === 'deep'
      ? 'from-[#040704]/85 via-[#080d08]/60 to-[#040604]/85'
      : darkness === 'subtle'
      ? 'from-[#050905]/50 via-transparent to-[#040604]/55'
      : 'from-[#050805]/65 via-[#070c07]/40 to-[#040604]/68';

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#060A06] ${className}`}>
      {/* 1. Full-Screen Un-zoomed Wide-Angle Study Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/videos/study-rain-lamp-poster.jpg"
        className="w-full h-full object-cover object-[center_bottom] brightness-[0.92] contrast-[1.05]"
      >
        <source src="/videos/study-rain-lamp.mp4" type="video/mp4" />
        <source src="/videos/study-rain-lamp.webm" type="video/webm" />
        {/* High resolution Fallback poster image */}
        <img
          src="/videos/study-rain-lamp-poster.jpg"
          alt="Wide-angle rainy study table with warm glowing lamp, open notebook, and books"
          className="w-full h-full object-cover object-[center_bottom]"
        />
      </video>

      {/* 2. Warm Amber Banker's Lamp Ambient Glow Aura (Coordinated with lamp at right side of table) */}
      {showLamp && (
        <div className="absolute top-[48%] right-[22%] sm:right-[24%] -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[420px] h-80 sm:h-[420px] pointer-events-none">
          {/* Soft breathing amber ambient light cone illuminating the study desk */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,190,55,0.24)_0%,rgba(255,145,30,0.09)_45%,transparent_72%)] animate-pulse" />
        </div>
      )}

      {/* 3. Subtle Vignette Overlay maintaining dark moody aesthetic without obscuring table or lamp */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlayOpacity} pointer-events-none`} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#040804]/55 via-transparent to-[#040804]/50 pointer-events-none" />

      {/* 4. Canvas-based dynamic rain streaks on the window pane above desk */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
    </div>
  );
};
