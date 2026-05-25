import React from 'react';

const ParticipantList = ({ participants, variant = 'standard', currentUserId = null }) => {
  if (!participants || participants.length === 0) return <div className="lobby-empty">עדיין אין משתתפים...</div>;

  const colors = [
    'var(--neon-purple)', 
    '#ff00ff', 
    'var(--neon-blue)', 
    'var(--neon-orange)',
    'var(--neon-green)',
    'var(--neon-blue)', 
    'var(--neon-purple)',
    'var(--neon-green)'
  ];

  const maxSlots = 8;
  const listToRender = variant === 'teacher' 
    ? Array.from({ length: maxSlots }, (_, i) => participants[i] || null)
    : participants;

  return (
    <div className={`lobby-roster ${variant === 'teacher' ? 'teacher-roster' : ''}`}>
      {listToRender.map((p, index) => {
        const color = colors[index % colors.length];
        
        if (!p) {
          return (
            <div key={`empty-${index}`} className="roster-item roster-box empty-slot">
              <div className="roster-slot-num" style={{ background: 'rgba(255,255,255,0.1)', color: '#888' }}>{index + 1}</div>
              <div className="roster-avatar-empty" style={{ marginTop: '10px' }}>
                <svg width="40" height="20" viewBox="0 0 40 20" fill="rgba(255,255,255,0.1)">
                  <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z"/>
                  <circle cx="10" cy="15" r="4" fill="rgba(0,0,0,0.5)"/>
                  <circle cx="30" cy="15" r="4" fill="rgba(0,0,0,0.5)"/>
                </svg>
              </div>
              <div className="roster-name-empty">ממתין...</div>
            </div>
          );
        }

        const isMe = currentUserId && p.id === currentUserId;

        return (
          <div key={p.id || index} className={`roster-item ${variant === 'teacher' ? 'roster-box' : ''}`} style={variant === 'teacher' ? { borderColor: color, boxShadow: `0 0 10px ${color}33, inset 0 0 10px ${color}33` } : {}}>
            {variant === 'teacher' && (
              <div className="roster-slot-num" style={{ background: color, color: '#111', textShadow: 'none' }}>{index + 1}</div>
            )}
            <div className="roster-avatar" style={variant === 'teacher' ? { border: 'none', boxShadow: 'none' } : { borderColor: color, boxShadow: `0 0 10px ${color}, inset 0 0 10px ${color}` }}>
              {variant === 'teacher' ? (
                <svg width="60" height="30" viewBox="0 0 40 20" style={{ filter: `drop-shadow(0 0 10px ${color})`, marginTop: '5px' }}>
                  <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" fill={color}/>
                  <circle cx="10" cy="15" r="4" fill="#111"/>
                  <circle cx="30" cy="15" r="4" fill="#111"/>
                  <rect x="18" y="2" width="10" height="4" fill="rgba(255,255,255,0.8)" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              )}
            </div>
            <div className="roster-name">{p.displayName} {isMe ? '(אתה)' : ''}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ParticipantList;
