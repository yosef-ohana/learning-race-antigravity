import React from 'react';

/**
 * StudentRaceOverlays — presentational only.
 * Renders visual overlays on top of the stage:
 *   - SSE disconnection banner
 *   - Frozen status overlay
 *   - Event feedback toast (correct/wrong/timeout/hint/replace)
 *   - Luck popup toast (boost/puncture)
 */
const StudentRaceOverlays = ({ sseError, isFrozen, frozenTimeRemaining, event, luckPopup }) => (
  <>
    {/* Disconnection overlay */}
    {sseError && (
      <div className="overlay-blur hebrew-text" style={{ zIndex: 9999, color: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: 'inset 0 0 50px rgba(255,0,0,0.2)' }}>
        <h2 style={{ fontSize: '3rem' }}>החיבור נותק</h2>
        <p>מנסה להתחבר מחדש...</p>
      </div>
    )}

    {/* Frozen overlay */}
    {isFrozen && (
      <div className="student-feedback-overlay hebrew-text">
        <div className="student-feedback-card frozen">
          <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>🧊</div>
          <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>קפוא!</h1>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>מערכת נעולה: <span className="bidi-isolate" style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{frozenTimeRemaining}</span> שניות</h2>
        </div>
      </div>
    )}

    {/* Event feedback toast */}
    {event && (
      <div className="student-feedback-overlay hebrew-text" style={{ zIndex: 90, pointerEvents: 'none', background: 'transparent', backdropFilter: 'none' }}>
        <div className={`student-feedback-card ${
          event.includes('נכונה') || event.includes('רמז') || event.includes('הוחלפה') ? 'success' : 'error'
        }`} style={{ pointerEvents: 'none' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
            {event.includes('נכונה') ? '🎉' :
             event.includes('רמז') ? '💡' :
             event.includes('הוחלפה') ? '🔄' :
             event.includes('זמן') ? '⏰' : '💥'}
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{event}</h1>
        </div>
      </div>
    )}

    {/* Luck popup toast */}
    {luckPopup && (
      <div className="student-feedback-overlay hebrew-text" style={{ zIndex: 100, pointerEvents: 'none', background: 'transparent', backdropFilter: 'none' }}>
        <div className={`student-feedback-card luck ${luckPopup.type === 'BOOST' ? 'boost' : 'puncture'}`} style={{ pointerEvents: 'none' }}>
          <h1 style={{
            fontSize: '1.6rem',
            color: luckPopup.type === 'BOOST' ? 'var(--neon-green)' : 'var(--danger)',
            textShadow: luckPopup.type === 'BOOST' ? '0 0 15px var(--neon-green)' : '0 0 15px var(--danger)',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {luckPopup.text}
          </h1>
        </div>
      </div>
    )}
  </>
);

export default StudentRaceOverlays;
