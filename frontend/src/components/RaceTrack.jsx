import React from 'react';
import { TRACK_LENGTH } from '../config/Constants';

const RaceTrack = ({ participantsPositions, currentUserId }) => {
  if (!participantsPositions || participantsPositions.length === 0) return null;
  return (
    <div className="race-track-container" style={{ position: 'relative', height: '120px', backgroundColor: '#e0e0e0', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
      {/* Background track details */}
      <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', backgroundColor: '#fff', transform: 'translateY(-50%)', borderTop: '2px dashed #999' }}></div>
      <div style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '20px', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏁</div>
      
      {participantsPositions.map((p, idx) => {
        const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100)); // Cap at 95% so cars don't overflow entirely
        const color = `hsl(${(p.id * 137.5) % 360}, 70%, 50%)`;
        const isMe = p.id === currentUserId;
        
        // Offset vertically to avoid exact overlap.
        const laneOffset = (idx % 3) * 25 - 25; // -25, 0, 25
        
        return (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${percent}%`,
            top: `calc(50% + ${laneOffset}px)`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.5s ease-in-out',
            zIndex: isMe ? 10 : 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: isMe ? '#fff' : 'rgba(255,255,255,0.8)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: isMe ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              marginBottom: '2px',
              border: isMe ? `2px solid ${color}` : 'none'
            }}>
              {p.displayName} ({p.points}pt)
            </div>
            
            <svg width="32" height="16" viewBox="0 0 32 16" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
              <path d="M4 12 l 0 -4 l 4 -4 l 12 0 l 4 4 l 4 0 l 0 4 Z" fill={color}/>
              <circle cx="8" cy="12" r="3" fill="#333"/>
              <circle cx="24" cy="12" r="3" fill="#333"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export default RaceTrack;
