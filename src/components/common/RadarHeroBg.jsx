import React from 'react';

/**
 * RadarHeroBg -- Restored original animated radar design:
 *   • Concentric circles and rotating sweep beam
 *   • Pulsing sonar ripples
 *   • Ambient background glow
 *   • Updated colors to brand Neon Orange (#FF5000 / rgb(255, 80, 0))
 */
export default function RadarHeroBg({ darkMode }) {
  const ringSizes = [180, 360, 560, 780, 1040, 1320, 1620, 1940];

  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
  const ringBorderColor = darkMode ? 'rgba(255, 255, 255, 0.055)' : 'rgba(0, 0, 0, 0.048)';
  const ringAccentColor = darkMode ? 'rgba(255, 80, 0, 0.15)' : 'rgba(255, 80, 0, 0.12)';

  return (
    <div
      className="radar-hero-bg-container"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* 1. Subtle Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
          backgroundPosition: 'center center',
          opacity: 1,
        }}
      />

      {/* 2. Warm ambient gradient glows (Bottom Right & Center as in image) */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(255, 80, 0, 0.16) 0%, rgba(255, 80, 0, 0.04) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 95, 0, 0.18) 0%, rgba(255, 120, 40, 0.08) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(255, 80, 0, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 80, 0, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 3. Center Origin Radar System */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radar Center Axis Lines */}
        <div
          style={{
            position: 'absolute',
            width: '100vw',
            height: '1px',
            background: darkMode
              ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: '100vh',
            width: '1px',
            background: darkMode
              ? 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
          }}
        />

        {/* Concentric Sonar / Radar Rings */}
        {ringSizes.map((size, idx) => {
          const isAccent = idx === 1 || idx === 3;
          return (
            <div
              key={size}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `1px ${idx % 3 === 2 ? 'dashed' : 'solid'} ${isAccent ? ringAccentColor : ringBorderColor}`,
                boxShadow: isAccent
                  ? (darkMode ? '0 0 16px rgba(255, 80, 0, 0.08)' : '0 0 16px rgba(255, 80, 0, 0.05)')
                  : 'none',
              }}
            />
          );
        })}

        {/* Pulsing Sonar Ripple Waves */}
        <div className="radar-pulse-ring radar-pulse-1" style={{ borderColor: darkMode ? 'rgba(255,80,0,0.3)' : 'rgba(255,80,0,0.25)' }} />
        <div className="radar-pulse-ring radar-pulse-2" style={{ borderColor: darkMode ? 'rgba(255,80,0,0.25)' : 'rgba(255,80,0,0.2)' }} />
        <div className="radar-pulse-ring radar-pulse-3" style={{ borderColor: darkMode ? 'rgba(255,80,0,0.2)' : 'rgba(255,80,0,0.15)' }} />

        {/* Rotating Radar Scanner Sweep Beam */}
        <div
          className="radar-sweep-beam"
          style={{
            position: 'absolute',
            width: '1400px',
            height: '1400px',
            borderRadius: '50%',
            background: darkMode
              ? 'conic-gradient(from 0deg, rgba(255, 80, 0, 0.18) 0deg, rgba(255, 80, 0, 0.05) 30deg, transparent 65deg, transparent 360deg)'
              : 'conic-gradient(from 0deg, rgba(255, 80, 0, 0.13) 0deg, rgba(255, 80, 0, 0.035) 35deg, transparent 75deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 60%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 60%, transparent 80%)',
          }}
        />
      </div>

      {/* 4. Radial Vignette to softly fade edges into page bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: darkMode
            ? 'radial-gradient(ellipse 75% 65% at 50% 46%, transparent 40%, #0F0F0F 95%)'
            : 'radial-gradient(ellipse 75% 65% at 50% 46%, transparent 40%, #FFFFFF 95%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
