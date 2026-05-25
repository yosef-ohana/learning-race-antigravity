import React from 'react';
import { TRACK_LENGTH } from '../config/Constants';

const RaceTrack = ({ participantsPositions, currentUserId }) => {
  if (!participantsPositions || participantsPositions.length === 0) return null;
  return (
    <div className="race-track-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', padding: '1rem', borderRadius: '12px' }}>
      {participantsPositions.map((p, idx) => {
        const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100)); 
        const isMe = p.id === currentUserId;
        const color = isMe ? 'var(--neon-blue)' : `hsl(${(p.id * 137.5) % 360}, 70%, 50%)`;
        
        return (
          <div key={p.id} className={isMe ? 'lane-highlight' : ''} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }}>
            
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: color, textShadow: `0 0 10px ${color}`, marginRight: '1rem' }}>
              {p.rank || idx + 1}
            </div>
            
            <div style={{ width: '150px', fontSize: '1.2rem', fontWeight: isMe ? 'bold' : 'normal', color: isMe ? '#fff' : '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.displayName} {isMe ? '(You)' : ''}
            </div>
            
            <div style={{ flex: 1, height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', margin: '0 1rem', position: 'relative', border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percent}%`, background: color, boxShadow: `0 0 15px ${color}`, borderRadius: '6px', transition: 'width 0.5s ease-out' }}></div>
              
              <div style={{ position: 'absolute', left: `calc(${percent}% - 20px)`, top: '50%', transform: 'translateY(-50%)', transition: 'left 0.5s ease-out', zIndex: 10 }}>
                <svg width="40" height="20" viewBox="0 0 40 20" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
                  <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" fill={color}/>
                  <circle cx="10" cy="15" r="4" fill="#111"/>
                  <circle cx="30" cy="15" r="4" fill="#111"/>
                  <rect x="18" y="2" width="10" height="4" fill="rgba(255,255,255,0.5)" />
                </svg>
              </div>
            </div>
            
            <div style={{ width: '80px', textAlign: 'right', fontSize: '1.2rem', color: '#fff', textShadow: `0 0 5px ${color}` }}>
              {p.points}pt
            </div>
            
          </div>
        );
      })}
    </div>
  );
};

export default RaceTrack;
