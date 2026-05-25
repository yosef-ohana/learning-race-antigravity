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
    <div className="timer-container" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '1rem' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center', color: 'var(--neon-blue)' }}>
        TIME REMAINING: {timeLeft}s
      </div>
      <div style={{ height: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--neon-blue)' }}>
        <div className="timer-fill" style={{ height: '100%', background: 'var(--neon-blue)', width: `${Math.min(100, percent)}%`, transition: 'width 0.5s linear' }}></div>
      </div>
    </div>
  );
};

export default TimerDisplay;
