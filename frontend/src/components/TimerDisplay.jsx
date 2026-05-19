import React, { useState, useEffect } from 'react';

const TimerDisplay = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Time Left: {timeLeft}s</div>;
};

export default TimerDisplay;
