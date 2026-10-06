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

export const RainCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    // Falling rain streaks
    const drops: Drop[] = [];
    const dropCount = Math.floor(width / 16);
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 24 + 16,
        speed: Math.random() * 7 + 9,
        opacity: Math.random() * 0.25 + 0.12
      });
    }

    // Static/slow dripping glass droplets
    const glassBeads: GlassBead[] = [];
    for (let i = 0; i < 45; i++) {
      glassBeads.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.2,
        drift: Math.random() * 0.15 + 0.05
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep rainy pine window gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#101306');
      bgGrad.addColorStop(0.5, '#161908');
      bgGrad.addColorStop(1, '#0D1005');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cozy desk lamp warm ambient glow (bottom-center)
      const lampGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.65,
        20,
        width * 0.5,
        height * 0.65,
        width * 0.45
      );
      lampGrad.addColorStop(0, 'rgba(255, 215, 0, 0.12)');
      lampGrad.addColorStop(0.4, 'rgba(230, 230, 184, 0.05)');
      lampGrad.addColorStop(1, 'rgba(26, 26, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw glass beads
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

        // Droplet specular highlight
        ctx.beginPath();
        ctx.arc(bead.x - bead.radius * 0.3, bead.y - bead.radius * 0.3, bead.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      }

      // Draw rain streaks
      ctx.lineWidth = 1;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(230, 230, 184, ${d.opacity})`;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x -= 0.6; // slight wind slant
        if (d.y > height) {
          d.y = -d.length;
          d.x = Math.random() * width + 50;
        }
      }

      // Vignette effect around edges
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.3,
        width / 2,
        height / 2,
        width * 0.75
      );
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(10, 10, 0, 0.65)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

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
