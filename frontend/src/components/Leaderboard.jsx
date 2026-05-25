import React from 'react';

const Leaderboard = ({ leaderboard, variant = 'standard' }) => {
  if (!leaderboard || leaderboard.length === 0) return <div>No data</div>;

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
