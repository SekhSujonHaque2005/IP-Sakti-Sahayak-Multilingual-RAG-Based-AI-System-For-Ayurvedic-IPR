import React from 'react';

/**
 * ShaderBackground
 * An organic, living ambient shader mesh with drifting luminous light blooms
 * in warm Ayurvedic hues (Terracotta, Forest Pine, Warm Cream, and Sage Mist),
 * layered with an ultra-fine tactile grain texture.
 */
export const ShaderBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── AMBIENT SHADER LIGHT BLOOMS ─────────────────────────────────── */}
      {/* Bloom 1: Warm Terracotta Radiance (Top-Left) */}
      <div className="absolute -top-[12%] -left-[8%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-br from-[#924E2B]/18 via-[#924E2B]/8 to-transparent blur-[110px] animate-shader-1" />

      {/* Bloom 2: Forest Pine Depths (Top-Right) */}
      <div className="absolute -top-[8%] -right-[12%] w-[58vw] h-[58vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-bl from-[#283D34]/14 via-[#283D34]/6 to-transparent blur-[120px] animate-shader-2" />

      {/* Bloom 3: Golden Warm Cream Glow (Center-Right) */}
      <div className="absolute top-[32%] right-[2%] w-[52vw] h-[52vw] max-w-[720px] max-h-[720px] rounded-full bg-gradient-to-tl from-[#EDE4D3]/75 via-[#E5DAC6]/45 to-transparent blur-[100px] animate-shader-3" />

      {/* Bloom 4: Soft Sage & Musky Khaki Wash (Bottom-Left) */}
      <div className="absolute -bottom-[12%] -left-[6%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full bg-gradient-to-tr from-[#A29D7D]/20 via-[#D4CEC1]/25 to-transparent blur-[130px] animate-shader-4" />

      {/* Bloom 5: Subtle Terracotta Ember Pulse (Bottom-Right) */}
      <div className="absolute bottom-[6%] right-[12%] w-[42vw] h-[42vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-l from-[#924E2B]/12 via-[#EDE4D3]/35 to-transparent blur-[95px] animate-shader-1" />

      {/* ── ULTRA-FINE SHADER GRAIN TEXTURE ────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.032] mix-blend-color-burn">
        <filter id="shader-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#shader-grain)" />
      </svg>
    </div>
  );
};
