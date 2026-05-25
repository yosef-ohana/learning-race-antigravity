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
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`body-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Speed / Motion lines behind the car */}
      <g opacity="0.7">
        <line x1="-15" y1="18" x2="10" y2="18" stroke={color} strokeWidth="1" strokeDasharray="3 3" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-25" y1="24" x2="5" y2="24" stroke={color} strokeWidth="1.2" strokeDasharray="6 3" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-10" y1="30" x2="8" y2="30" stroke={color} strokeWidth="0.8" strokeDasharray="2 4" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      </g>

      {/* Underglow (neon halo underneath the car) */}
      <ellipse cx="50" cy="34" rx="35" ry="4" fill={color} opacity="0.6" filter={`url(#neon-glow-${color.replace('#', '')})`} />

      {/* Main Car Body Silhouette */}
      <path 
        d="M 12 28 
           L 12 22 
           C 12 18, 18 17, 22 19 
           L 28 19 
           C 35 11, 45 9, 52 9 
           L 68 9 
           C 76 9, 81 14, 85 18 
           L 94 18 
           C 97 18, 98 22, 97 25 
           L 95 28 
           Z"
        fill={`url(#body-grad-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="1.8"
        filter={`url(#neon-glow-${color.replace('#', '')})`}
      />

      {/* Futuristic Cabin Window */}
      <path
        d="M 38 19
           L 44 11
           L 66 11
           L 72 19
           Z"
        fill="rgba(5, 5, 16, 0.85)"
        stroke={color}
        strokeWidth="1"
        opacity="0.9"
      />

      {/* Headlight */}
      <path 
        d="M 94 19 L 97 20 L 94 22" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        fill="none"
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Taillight */}
      <line 
        x1="12" y1="21" x2="12" y2="25" 
        stroke="#ff3333" 
        strokeWidth="2.5" 
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Wheels */}
      {/* Back Wheel */}
      <circle cx="30" cy="28" r="7.5" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="30" cy="28" r="4.5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      <circle cx="30" cy="28" r="1.5" fill={color} />

      {/* Front Wheel */}
      <circle cx="72" cy="28" r="7.5" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="72" cy="28" r="4.5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      <circle cx="72" cy="28" r="1.5" fill={color} />
    </svg>
  );
};

export default CarIcon;
