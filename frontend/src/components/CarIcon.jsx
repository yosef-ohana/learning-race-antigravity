import React from 'react';

export const neonColors = [
  '#bc13fe', // PURPLE
  '#ff00ff', // PINK
  '#00f3ff', // BLUE
  '#ffaa00', // ORANGE
  '#00ff00', // GREEN
  '#ffff00', // YELLOW
  '#00ffff', // CYAN
  '#ff0000'  // RED
];

export const getParticipantColor = (participant, allParticipants = [], fallbackIndex = 0) => {
  if (!participant) return neonColors[fallbackIndex % 8];

  const getStableId = (p, idx) => {
    if (!p) return `fallback_${idx}`;
    if (p.id !== undefined && p.id !== null) return String(p.id);
    if (p.userId !== undefined && p.userId !== null) return String(p.userId);
    return `fallback_${idx}`;
  };

  const targetId = getStableId(participant, fallbackIndex);

  const validParticipants = allParticipants.map((p, idx) => ({
    original: p,
    id: getStableId(p, idx)
  })).filter(p => p.original !== null && p.original !== undefined);

  const uniqueIds = Array.from(new Set(validParticipants.map(p => p.id)));
  
  uniqueIds.sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });

  const colorIndex = uniqueIds.indexOf(targetId);
  if (colorIndex !== -1) {
    return neonColors[colorIndex % 8];
  }

  return neonColors[fallbackIndex % 8];
};

const CarIcon = ({ color = '#bc13fe', width = 60, height = 30, style = {} }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 40" 
      style={{ overflow: 'visible', ...style }}
    >
      <defs>
        <filter id={`neon-glow-${color.replace('#', '')}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`body-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.05" />
          <stop offset="50%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Speed / Motion lines behind the car */}
      <g opacity="0.6">
        <line x1="-15" y1="14" x2="5" y2="14" stroke={color} strokeWidth="1" strokeDasharray="3 3" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-25" y1="21" x2="3" y2="21" stroke={color} strokeWidth="1.2" strokeDasharray="6 3" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-10" y1="27" x2="8" y2="27" stroke={color} strokeWidth="0.8" strokeDasharray="2 4" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      </g>

      {/* Underglow (neon halo underneath the car) */}
      <ellipse cx="50" cy="34" rx="38" ry="4" fill={color} opacity="0.6" filter={`url(#neon-glow-${color.replace('#', '')})`} />

      {/* Main Car Body Silhouette */}
      <path 
        d="M 11 28 
           L 11 20 
           L 8 12 
           L 17 12 
           L 20 18 
           L 42 16 
           L 48 10 
           L 65 10 
           L 78 19 
           L 92 23 
           L 95 26 
           L 90 28 
           L 80 28 
           A 8 8 0 0 0 64 28 
           L 38 28 
           A 8 8 0 0 0 22 28 
           Z"
        fill={`url(#body-grad-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="1.8"
        filter={`url(#neon-glow-${color.replace('#', '')})`}
      />

      {/* Futuristic Cabin Window */}
      <path
        d="M 50 12 L 64 12 L 74 19 L 45 19 Z"
        fill="rgba(5, 5, 16, 0.9)"
        stroke={color}
        strokeWidth="1"
        opacity="0.9"
      />
      <line x1="59" y1="12" x2="59" y2="19" stroke={color} strokeWidth="1" opacity="0.7" />

      {/* Aerodynamic side vent panel crease */}
      <path
        d="M 32 21 H 46 L 40 25"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.8"
      />

      {/* Headlight */}
      <path 
        d="M 88 22 L 93 24 L 89 25" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        fill="none"
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Taillight */}
      <line 
        x1="11" y1="20" x2="11" y2="25" 
        stroke="#ff3333" 
        strokeWidth="2.5" 
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Wheels */}
      {/* Back Wheel */}
      <circle cx="30" cy="28" r="7.5" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="30" cy="28" r="4.5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      {/* 8-Spoke Neon Rim Detail */}
      <g stroke={color} strokeWidth="0.8" opacity="0.9">
        <line x1="26" y1="28" x2="34" y2="28" />
        <line x1="30" y1="24" x2="30" y2="32" />
        <line x1="27.2" y1="25.2" x2="32.8" y2="30.8" />
        <line x1="27.2" y1="30.8" x2="32.8" y2="25.2" />
      </g>
      <circle cx="30" cy="28" r="1.5" fill="#fff" />

      {/* Front Wheel */}
      <circle cx="72" cy="28" r="7.5" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="72" cy="28" r="4.5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      {/* 8-Spoke Neon Rim Detail */}
      <g stroke={color} strokeWidth="0.8" opacity="0.9">
        <line x1="68" y1="28" x2="76" y2="28" />
        <line x1="72" y1="24" x2="72" y2="32" />
        <line x1="69.2" y1="25.2" x2="74.8" y2="30.8" />
        <line x1="69.2" y1="30.8" x2="74.8" y2="25.2" />
      </g>
      <circle cx="72" cy="28" r="1.5" fill="#fff" />
    </svg>
  );
};

export default CarIcon;
