import React from 'react';

const Leaderboard = ({ leaderboard, variant = 'standard' }) => {
  if (!leaderboard || leaderboard.length === 0) return <div>No data</div>;

  if (variant === 'teacher-table') {
    const colors = [
      'var(--neon-orange)', 
      '#ff00ff', 
      'var(--neon-blue)', 
      'var(--neon-orange)',
      'var(--neon-green)',
      '#ff00ff'
    ];

    return (
      <div className="t-results-table-container">
        <table className="t-results-table">
          <thead>
            <tr>
              <th>מיקום</th>
              <th>שחקן</th>
              <th>רכב</th>
              <th>נקודות</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const color = colors[(rank - 1) % colors.length] || 'var(--neon-blue)';
              return (
                <tr key={entry.userId || entry.id}>
                  <td>
                    <div className="t-res-rank" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{entry.displayName}</td>
                  <td>
                    <svg width="60" height="30" viewBox="0 0 40 20" style={{ filter: `drop-shadow(0 0 10px ${color})` }}>
                      <path d="M5 15 L 5 5 L 10 5 L 15 0 L 30 0 L 35 5 L 35 15 Z" fill={color}/>
                      <circle cx="10" cy="15" r="4" fill="#111"/>
                      <circle cx="30" cy="15" r="4" fill="#111"/>
                      <rect x="18" y="2" width="10" height="4" fill="rgba(255,255,255,0.8)" />
                    </svg>
                  </td>
                  <td style={{ color: color, fontWeight: 'bold', fontSize: '1.4rem', textShadow: `0 0 10px ${color}` }}>
                    {entry.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (variant === 'cyberpunk') {
    return (
      <div className="leaderboard-list">
        {leaderboard.map((entry, idx) => {
          const rank = entry.rank || idx + 1;
          let color = 'var(--neon-blue)';
          if (rank === 1) color = 'var(--neon-orange)';
          else if (rank === 2) color = 'var(--neon-purple)';
          
          return (
            <div key={entry.userId || entry.id} className="leaderboard-row">
              <div className="leaderboard-badge" style={{ border: `2px solid ${color}`, color: color, textShadow: `0 0 10px ${color}`, boxShadow: `inset 0 0 10px ${color}` }}>
                {rank}
              </div>
              
              <div style={{ flex: 1, fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                {entry.displayName}
              </div>
              
              <div style={{ fontSize: '1.5rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)', fontWeight: 'bold' }}>
                {entry.points} pts
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((entry, idx) => (
          <tr key={entry.userId || entry.id}>
            <td>{entry.rank || idx + 1}</td>
            <td>{entry.displayName}</td>
            <td>{entry.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Leaderboard;
