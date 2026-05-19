import React from 'react';

const ParticipantList = ({ participants }) => {
  if (!participants || participants.length === 0) return <div>No participants yet.</div>;
  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {participants.map(p => (
        <li key={p.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
          {p.displayName}
        </li>
      ))}
    </ul>
  );
};

export default ParticipantList;
