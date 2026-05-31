import React from 'react';
import CarIcon, { getParticipantColor } from './CarIcon';

const Leaderboard = ({ leaderboard, variant = 'standard' }) => {
  if (!leaderboard || leaderboard.length === 0) return <div>אין נתונים</div>;

  if (variant === 'teacher-table') {

    return (
      <div className="t-results-table-container">
        <table className="t-results-table">
          <thead>
            <tr>
              <th>מיקום</th>
              <th>שחקן</th>
              <th>רכב</th>
              <th>נקודות</th>
              <th>דיוק</th>
              <th>נכונות</th>
              <th>זמן ממוצע</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const color = getParticipantColor(entry, leaderboard, idx);
              return (
                <tr key={entry.userId || entry.id}>
                  <td>
                    <div className="t-res-rank" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                  </td>
                  <td style={{ fontWeight: 'bold', fontSize: 'clamp(0.95rem, 1.8vh, 1.15rem)' }}>{entry.displayName}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CarIcon color={color} width={46} height={23} />
                    </div>
                  </td>
                  <td style={{ color: color, fontWeight: 'bold', fontSize: 'clamp(1rem, 2vh, 1.3rem)', textShadow: `0 0 10px ${color}` }}>
                    {entry.points}
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--neon-blue)', fontSize: 'clamp(0.9rem, 1.6vh, 1.1rem)' }}>
                    {entry.accuracyPercent ?? 0}%
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--neon-blue)', fontSize: 'clamp(0.9rem, 1.6vh, 1.1rem)' }}>
                    {entry.correctAnswersCount ?? 0}/{entry.answeredQuestionsCount ?? 0}
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--neon-blue)', fontSize: 'clamp(0.9rem, 1.6vh, 1.1rem)' }}>
                    {entry.averageAnswerTimeSeconds ?? 0}s
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
          const color = getParticipantColor(entry, leaderboard, idx);
          
          return (
            <div key={entry.userId || entry.id} className="leaderboard-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="leaderboard-badge" style={{ border: `2px solid ${color}`, color: color, textShadow: `0 0 10px ${color}`, boxShadow: `inset 0 0 10px ${color}` }}>
                {rank}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', width: '55px' }}>
                <CarIcon color={color} width={50} height={25} />
              </div>
              
              <div style={{ flex: 1, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }} className="hebrew-text">
                {entry.displayName}{entry.isCurrentUser ? ' (אתה)' : ''}
              </div>
              
              <div style={{ fontSize: '1.3rem', color: color, textShadow: `0 0 10px ${color}`, fontWeight: 'bold' }} className="hebrew-text">
                {entry.points} נק'
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
          <th>מיקום</th>
          <th>שם</th>
          <th>נקודות</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((entry, idx) => (
          <tr key={entry.userId || entry.id}>
            <td>{entry.rank || idx + 1}</td>
            <td>{entry.displayName}{entry.isCurrentUser ? ' — אתה' : ''}</td>
            <td>{entry.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Leaderboard;
