import React from 'react';

const Leaderboard = ({ leaderboard }) => {
  if (!leaderboard || leaderboard.length === 0) return <div>No data</div>;
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
