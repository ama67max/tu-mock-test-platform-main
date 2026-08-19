import React, { useMemo, useState } from 'react';

// A "vague grid" page that scatters scrambled high-school formulae across a responsive grid.
// Each tile shows a scrambled formula with slight rotation/opacity to achieve a "vague" collage effect.

const FORMULAE = [
  'x = [-b \u00B1 \u221A(b^2 - 4ac)]/(2a)', // quadratic formula
  'a^2 + b^2 = c^2', // Pythagorean
  'A = \u03C0r^2', // area of circle
  'C = 2\u03C0r', // circumference
  'y = mx + c', // slope-intercept
  'd = \u221A[(x2-x1)^2 + (y2-y1)^2]', // distance
  'V = lwh', // volume cuboid
  'A = 1/2 bh', // area triangle
  's = ut + 1/2 at^2', // SUVAT kinematic
  'F = ma', // Newton
  'P = IV', // electric power
  'I = V/R', // ohm
  'sin^2\u03B8 + cos^2\u03B8 = 1', // trig identity
  'Area_{circle} = \u03C0r^2',
  'Compound: A = P(1 + r/n)^{nt}',
];

function scramble(text) {
  // simple character shuffler that preserves spaces sometimes for readability
  const chars = text.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function makeTiles(count) {
  const tiles = [];
  for (let i = 0; i < count; i++) {
    const formula = FORMULAE[i % FORMULAE.length];
    tiles.push({
      id: i,
      text: scramble(formula),
      rotation: (Math.random() - 0.5) * 40, // -20deg..20deg
      opacity: 0.25 + Math.random() * 0.6,
      scale: 0.9 + Math.random() * 0.3,
      skew: (Math.random() - 0.5) * 8,
    });
  }
  return tiles;
}

export default function VagueGrid() {
  // Decide number of tiles based on viewport roughness; use 64 as default large collage
  const [count, setCount] = useState(56);
  const [seed, setSeed] = useState(0);

  const tiles = useMemo(() => makeTiles(count + (seed % 7)), [count, seed]);

  return (
    <div className="min-h-screen bg-background text-primary p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Vague Grid — Scrambled Formulae</h1>
        <div className="flex gap-2 items-center">
          <label className="text-sm opacity-70">Tiles</label>
          <input
            type="range"
            min="24"
            max="120"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-36"
          />
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1 rounded bg-primary text-on-primary text-sm shadow"
          >
            Reshuffle
          </button>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.id}
            className="relative rounded border border-border-primary bg-surface/40 p-2 overflow-hidden h-24 flex items-center justify-center"
            style={{
              transform: `rotate(${t.rotation}deg) skew(${t.skew}deg) scale(${t.scale})`,
              opacity: t.opacity,
              backdropFilter: 'blur(2px) saturate(80%)',
            }}
            aria-hidden
          >
            <div
              className="text-xs text-center leading-tight break-words select-none"
              style={{ transform: `rotate(${ -t.rotation / 6 }deg)` }}
              dangerouslySetInnerHTML={{ __html: t.text.replace(/\n/g, '<br/>') }}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm opacity-60">
        A purposely vague visual — formulae are scrambled and scattered for a collage/texture effect. Use "Reshuffle" to regenerate.
      </p>
    </div>
  );
}
