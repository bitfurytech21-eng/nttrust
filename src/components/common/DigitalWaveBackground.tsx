import React, { useEffect, useRef } from 'react';

interface DigitalWaveBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'deep';
}

export const DigitalWaveBackground: React.FC<DigitalWaveBackgroundProps> = ({
  className = '',
  intensity = 'deep'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        drawFrame(time);
      }
    };

    mediaQuery.addEventListener('change', handleMotionPreferenceChange);

    // Dynamic grid setup based on screen width
    const getGridConfig = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;

      return {
        cols: isMobile ? 48 : isTablet ? 68 : 92,
        rows: isMobile ? 32 : isTablet ? 42 : 56,
        spacingX: isMobile ? 28 : 24,
        spacingZ: isMobile ? 26 : 22,
        fov: 520,
        cameraY: isMobile ? -140 : -190,
        cameraZ: isMobile ? -280 : -340,
        tiltAngle: 0.44 // Isometric-like 3D pitch
      };
    };

    let gridConfig = getGridConfig();

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      gridConfig = getGridConfig();

      if (prefersReducedMotion) {
        drawFrame(time);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener('resize', handleResize);

    // Subtle interactive mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / (rect.width || 1) - 0.5;
      const relY = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
      targetMouseX = relX * 45;
      targetMouseY = relY * 30;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Multi-Harmonic 3D Wave Elevation Formula
    const calculateElevation = (gx: number, gz: number, t: number, waveLayer: number = 0) => {
      const offset = waveLayer * 1.5;
      // Primary undulating rolling wave
      const w1 = Math.sin(gx * 0.038 + gz * 0.032 + t * 0.85 + offset) * 42;
      // Cross-cutting secondary crest
      const w2 = Math.cos(gx * 0.022 - gz * 0.046 + t * 0.62) * 30;
      // Circular expanding ripple
      const dist = Math.sqrt(gx * gx + gz * gz);
      const w3 = Math.sin(dist * 0.025 - t * 0.75) * 22;
      // Micro harmonic vibration for digital fluidity
      const ripple = Math.sin(gx * 0.075 + t * 1.1) * Math.cos(gz * 0.075 + t * 0.8) * 14;
      // Diagonal flow drift
      const flow = Math.sin((gx * 0.8 + gz * 1.2) * 0.028 + t * 0.95) * 25;

      return w1 + w2 + w3 + ripple + flow;
    };

    // Render Frame
    const drawFrame = (currentTime: number) => {
      if (!ctx || width === 0 || height === 0) return;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const { cols, rows, spacingX, spacingZ, fov, cameraY, cameraZ, tiltAngle } = gridConfig;

      const halfGridWidth = (cols * spacingX) / 2;
      const halfGridDepth = (rows * spacingZ) / 2;
      const centerX = width / 2 + mouseX;
      const centerY = height * 0.5 + mouseY;

      const cosTilt = Math.cos(tiltAngle);
      const sinTilt = Math.sin(tiltAngle);

      type ProjectedPoint = {
        sx: number;
        sy: number;
        depthScale: number;
        alpha: number;
        elevation: number;
        xIndex: number;
        zIndex: number;
      };

      const points: (ProjectedPoint | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

      // 1. Compute 3D perspective projection for all grid points
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rawX = c * spacingX - halfGridWidth;
          const rawZ = r * spacingZ - halfGridDepth;

          const elevation = calculateElevation(rawX, rawZ, currentTime);

          const yRotated = elevation * cosTilt - rawZ * sinTilt - cameraY;
          const zRotated = elevation * sinTilt + rawZ * cosTilt - cameraZ;

          if (zRotated <= 15) continue;

          const depthScale = fov / (fov + zRotated);
          const sx = centerX + rawX * depthScale;
          const sy = centerY + yRotated * depthScale;

          // Edge falloff factors
          const edgeX = Math.sin((c / (cols - 1)) * Math.PI);
          const edgeZ = Math.sin((r / (rows - 1)) * Math.PI);
          const edgeFade = Math.pow(edgeX * edgeZ, 0.75);

          const heightNorm = (elevation + 70) / 140; // 0 to 1
          const baseAlpha = intensity === 'deep' ? 0.45 : intensity === 'medium' ? 0.35 : 0.25;
          const alpha = Math.max(0.04, Math.min(0.95, (baseAlpha + heightNorm * 0.55) * edgeFade * depthScale * 1.8));

          points[r][c] = {
            sx,
            sy,
            depthScale,
            alpha,
            elevation,
            xIndex: c,
            zIndex: r
          };
        }
      }

      // 2. Draw glowing curved contour lines across horizontal rows
      const step = window.innerWidth < 768 ? 2 : 1;
      for (let r = 0; r < rows; r += step) {
        ctx.beginPath();
        let isFirst = true;

        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (!pt) continue;

          if (isFirst) {
            ctx.moveTo(pt.sx, pt.sy);
            isFirst = false;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        }

        const rowProgress = r / rows;
        const lineFactor = Math.sin(rowProgress * Math.PI);
        const lineAlpha = (intensity === 'deep' ? 0.25 : 0.16) * lineFactor;

        ctx.lineWidth = Math.max(0.8, 1.4 * (1 - rowProgress * 0.4));
        ctx.strokeStyle = isDark
          ? `rgba(56, 189, 248, ${lineAlpha * 1.2})`
          : `rgba(14, 116, 214, ${lineAlpha * 1.1})`;
        ctx.stroke();
      }

      // 3. Draw secondary longitudinal mesh lines (fainter depth lattice)
      for (let c = 0; c < cols; c += (window.innerWidth < 768 ? 4 : 2)) {
        ctx.beginPath();
        let isFirst = true;

        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (!pt) continue;

          if (isFirst) {
            ctx.moveTo(pt.sx, pt.sy);
            isFirst = false;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        }

        const colProgress = c / cols;
        const colFactor = Math.sin(colProgress * Math.PI);
        const colAlpha = (intensity === 'deep' ? 0.12 : 0.08) * colFactor;

        ctx.lineWidth = 0.75;
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${colAlpha})`
          : `rgba(59, 130, 246, ${colAlpha})`;
        ctx.stroke();
      }

      // 4. Draw glowing luminous particle dots
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (!pt || pt.alpha <= 0.04) continue;

          const baseRadius = pt.depthScale * (1.3 + (pt.elevation > 18 ? 0.8 : 0)) * (intensity === 'deep' ? 1.45 : 1.2);
          const radius = Math.max(0.8, Math.min(3.8, baseRadius));

          let dotColor: string;
          let glowColor: string;

          if (isDark) {
            if (pt.elevation > 24) {
              dotColor = `rgba(224, 242, 254, ${Math.min(1, pt.alpha * 1.35)})`; // White-ice cyan crest
              glowColor = `rgba(56, 189, 248, ${pt.alpha * 0.75})`;
            } else if (pt.elevation > 5) {
              dotColor = `rgba(56, 189, 248, ${Math.min(1, pt.alpha * 1.2)})`; // Vivid Cyan
              glowColor = `rgba(37, 99, 235, ${pt.alpha * 0.55})`;
            } else if (pt.elevation > -15) {
              dotColor = `rgba(96, 165, 250, ${pt.alpha})`; // Electric Blue
              glowColor = `rgba(30, 64, 175, ${pt.alpha * 0.35})`;
            } else {
              dotColor = `rgba(59, 130, 246, ${pt.alpha * 0.75})`; // Deep Royal Blue
              glowColor = `rgba(29, 78, 216, ${pt.alpha * 0.25})`;
            }
          } else {
            // Deep High-Contrast Banking Mode
            if (pt.elevation > 24) {
              dotColor = `rgba(2, 132, 199, ${Math.min(1, pt.alpha * 1.3)})`; // Luminous Cyan-Blue
              glowColor = `rgba(14, 165, 233, ${pt.alpha * 0.65})`;
            } else if (pt.elevation > 5) {
              dotColor = `rgba(11, 31, 106, ${Math.min(1, pt.alpha * 1.2)})`; // Northern Trust Deep Navy
              glowColor = `rgba(37, 99, 235, ${pt.alpha * 0.5})`;
            } else if (pt.elevation > -15) {
              dotColor = `rgba(30, 58, 138, ${pt.alpha * 0.95})`; // Royal Sapphire
              glowColor = `rgba(59, 130, 246, ${pt.alpha * 0.35})`;
            } else {
              dotColor = `rgba(30, 64, 175, ${pt.alpha * 0.75})`; // Midnight Blue
              glowColor = `rgba(96, 165, 250, ${pt.alpha * 0.2})`;
            }
          }

          // Luminous outer particle halo for elevated points
          if (pt.elevation > 10 && pt.depthScale > 0.4) {
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, radius * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = glowColor;
            ctx.fill();
          }

          // Core crisp glowing dot
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      }
    };

    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (document.visibilityState === 'visible') {
        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;

        if (!prefersReducedMotion) {
          time += delta * 0.65;
          drawFrame(time);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion) {
      drawFrame(2.0);
    } else {
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, [intensity]);

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Deep Atmospheric Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060D24] via-[#09153A] to-[#050B1E] dark:from-[#030712] dark:via-[#070E22] dark:to-[#02050E]" />

      {/* Atmospheric Luminous Blue & Cyan Ambient Glow Pods */}
      <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-radial from-[#1E40AF]/30 via-[#0284C7]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[550px] h-[550px] rounded-full bg-radial from-[#0369A1]/25 via-[#1E3A8A]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[650px] h-[650px] rounded-full bg-radial from-[#0284C7]/20 via-[#0F172A]/30 to-transparent blur-3xl pointer-events-none" />

      {/* Subtle fine digital grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* High-Performance 3D Digital Wave Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95 dark:opacity-100 transition-opacity duration-700"
      />

      {/* Soft Vignette Mask to keep edges ultra-smooth */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#060D24]/60 pointer-events-none" />
    </div>
  );
};
