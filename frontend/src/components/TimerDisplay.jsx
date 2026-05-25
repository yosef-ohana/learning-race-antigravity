import React, { useState, useEffect } from 'react';

const TimerDisplay = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimeLeft, setInitialTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiresAt * 1000 - now) / 1000));
    setTimeLeft(remaining);
    setInitialTimeLeft(remaining > 0 ? remaining : 1);

    const interval = setInterval(() => {
      const currentRemaining = Math.max(0, Math.floor((expiresAt * 1000 - Date.now()) / 1000));
      setTimeLeft(currentRemaining);
      if (currentRemaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const percent = initialTimeLeft > 0 ? (timeLeft / initialTimeLeft) * 100 : 0;

  return (
    <div className="timer-container" style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1rem', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginRight: '1rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>
        ⏱️ {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.8)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--neon-blue)' }}>
        <div className="timer-fill" style={{ height: '100%', background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)', width: `${Math.min(100, percent)}%`, transition: 'width 0.5s linear' }}></div>
      </div>
    </div>
  );
};

export default TimerDisplay;
