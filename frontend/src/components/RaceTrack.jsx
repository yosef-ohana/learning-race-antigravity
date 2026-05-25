import React from 'react';
import { TRACK_LENGTH } from '../config/Constants';

const RaceTrack = ({ participantsPositions, currentUserId, variant = 'standard' }) => {
  if (!participantsPositions || participantsPositions.length === 0) return null;

  if (variant === 'dashboard') {
    const colors = [
      'var(--neon-orange)', 
      'var(--neon-purple)', 
      'var(--neon-blue)', 
      'var(--neon-orange)', 
      'var(--neon-green)'
    ];

    return (
      <div className="dashboard-track-list">
        {participantsPositions.map((p, idx) => {
          const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100));
          const rank = p.rank || idx + 1;
          const color = colors[(rank - 1) % colors.length];

          return (
            <div key={p.id} className="dashboard-track-row" style={{ borderLeft: `4px solid ${color}`, boxShadow: `inset 10px 0 20px -10px ${color}` }}>
              
              <div className="dash-rank" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
                {rank === 1 ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/><path d="M16 3h-8v4h8V3z"/></svg>
                ) : rank === 2 ? (
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-3 3h6l-3-3z"/><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ) : rank === 3 ? (
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-3 3h6l-3-3z"/><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ) : (
                  <div className="dash-rank-circle" style={{ borderColor: color }}>{rank}</div>
                )}
              </div>

              <div className="dash-avatar">
                <svg width="36" height="36" viewBox="0 0 24 24" fill={color} style={{ opacity: 0.8 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>

              <div className="dash-info">
                <div className="dash-name">{p.displayName}</div>
                <div className="dash-points" style={{ color: color }}>{p.points} נק'</div>
              </div>

              <div className="dash-bar-container">
                <div className="dash-bar-bg"></div>
                <div className="dash-bar-fill" style={{ width: `${percent}%`, left: 0, background: `linear-gradient(90deg, transparent, ${color})`, boxShadow: `5px 0 15px ${color}` }}></div>
                
                <div className="dash-car" style={{ left: `calc(${percent}% - 20px)` }}>
                  <svg width="50" height="25" viewBox="0 0 40 20" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
                    <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" fill={color}/>
                    <circle cx="10" cy="15" r="4" fill="#111"/>
                    <circle cx="30" cy="15" r="4" fill="#111"/>
                    <rect x="18" y="2" width="10" height="4" fill="rgba(255,255,255,0.8)" />
                  </svg>
                </div>
              </div>

              <div className="dash-percent" style={{ color: color }}>
                {Math.round(percent)}%
              </div>

            </div>
          );
        })}
      </div>
    );
  }

  // Original standard rendering (backward compatible)
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
