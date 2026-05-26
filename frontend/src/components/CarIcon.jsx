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
        <line x1="-20" y1="12" x2="5" y2="12" stroke={color} strokeWidth="1" strokeDasharray="3 3" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-30" y1="20" x2="3" y2="20" stroke={color} strokeWidth="1.5" strokeDasharray="8 4" filter={`url(#neon-glow-${color.replace('#', '')})`} />
        <line x1="-15" y1="27" x2="8" y2="27" stroke={color} strokeWidth="0.8" strokeDasharray="4 4" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      </g>

      {/* Underglow (neon halo underneath the car) */}
      <ellipse cx="50" cy="34" rx="38" ry="4" fill={color} opacity="0.6" filter={`url(#neon-glow-${color.replace('#', '')})`} />

      {/* Main Car Body Silhouette */}
      <path 
        d="M 10 13
           L 9 19
           L 11 28
           L 22 28
           A 8 8 0 0 0 38 28
           L 64 28
           A 8 8 0 0 0 80 28
           L 95 27
           L 83 20
           L 62 10
           L 48 10
           L 22 14
           Z"
        fill={`url(#body-grad-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="1.8"
        filter={`url(#neon-glow-${color.replace('#', '')})`}
      />

      {/* Futuristic Cabin Window */}
      <path
        d="M 47 12 
           L 63 12 
           L 74 18 
           L 44 18 
           Z"
        fill="rgba(5, 5, 20, 0.95)"
        stroke={color}
        strokeWidth="1"
        opacity="0.9"
      />
      <line x1="58" y1="12" x2="58" y2="18" stroke={color} strokeWidth="1" opacity="0.7" />

      {/* Cyberpunk triangular side intake vent */}
      <path
        d="M 44 18 L 36 21 L 43 25 Z"
        fill="rgba(5, 5, 20, 0.95)"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.9"
      />

      {/* Aesthetic body and door creases */}
      <path
        d="M 63 12 L 59 21 L 44 21 L 43 27"
        fill="none"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.6"
      />
      <line x1="38" y1="26.5" x2="64" y2="26.5" stroke={color} strokeWidth="1" opacity="0.8" />

      {/* Headlight */}
      <path 
        d="M 87 21 L 93 23 L 89 24" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        fill="none"
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Taillight */}
      <path 
        d="M 9.5 16 C 9 18, 9 20, 10.5 21" 
        stroke="#ff1a1a" 
        strokeWidth="2.2" 
        fill="none"
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Wing Spoiler neon crease */}
      <line 
        x1="10" y1="13" x2="16" y2="13.5" 
        stroke={color} 
        strokeWidth="1.5" 
        filter={`url(#neon-glow-${color.replace('#', '')})`} 
      />

      {/* Wheels */}
      {/* Back Wheel */}
      <circle cx="30" cy="28" r="8" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="30" cy="28" r="5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      {/* 8-Spoke Neon Rim Detail */}
      <g stroke={color} strokeWidth="0.8" opacity="0.9">
        <line x1="25" y1="28" x2="35" y2="28" />
        <line x1="30" y1="23" x2="30" y2="33" />
        <line x1="26.5" y1="24.5" x2="33.5" y2="31.5" />
        <line x1="26.5" y1="31.5" x2="33.5" y2="24.5" />
      </g>
      <circle cx="30" cy="28" r="1.5" fill="#fff" />

      {/* Front Wheel */}
      <circle cx="72" cy="28" r="8" fill="#050510" stroke={color} strokeWidth="1.5" filter={`url(#neon-glow-${color.replace('#', '')})`} />
      <circle cx="72" cy="28" r="5" fill="#000" stroke="#fff" strokeWidth="0.8" />
      {/* 8-Spoke Neon Rim Detail */}
      <g stroke={color} strokeWidth="0.8" opacity="0.9">
        <line x1="67" y1="28" x2="77" y2="28" />
        <line x1="72" y1="23" x2="72" y2="33" />
        <line x1="68.5" y1="24.5" x2="75.5" y2="31.5" />
        <line x1="68.5" y1="31.5" x2="75.5" y2="24.5" />
      </g>
      <circle cx="72" cy="28" r="1.5" fill="#fff" />
    </svg>
  );
};

export default CarIcon;
