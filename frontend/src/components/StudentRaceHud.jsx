import React from 'react';
import RaceTrack from './RaceTrack';

/**
 * StudentRaceHud — presentational only.
 * Renders the top status bar: live indicator, rank, points,
 * luck/boost badges, decision meter, and the race track.
 */
const StudentRaceHud = ({ playerState, participantsPositions, activeLuckMultiplier }) => (
  <div className="student-top" style={{ padding: '0.3rem 0.6rem 0.3rem' }}>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', padding: '0 0.4rem' }}>

      {/* Left: live indicator + rank */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="live-indicator hebrew-text" style={{ fontSize: '0.85rem' }}>שידור חי</div>
        <div className="glow-card hebrew-text" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', border: '1px solid var(--neon-purple)', color: '#fff' }}>
          🏆 מיקום {playerState.rank}/{participantsPositions.length}
        </div>
      </div>

      {/* Center: points + luck badges */}
      <div className="glow-card hebrew-text" style={{ padding: '0.3rem 1rem', color: 'var(--neon-blue)', borderColor: 'var(--neon-blue)', fontSize: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{playerState.points}</span> נק'
        </div>
        {activeLuckMultiplier > 1 && (
          <div style={{ padding: '0.1rem 0.4rem', background: 'rgba(0, 255, 0, 0.1)', border: '1px solid var(--neon-green)', borderRadius: '4px', color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 0 5px var(--neon-green)', whiteSpace: 'nowrap' }} className="hebrew-text">
            ⚡ בוסט <span className="bidi-isolate">x1.5</span>
          </div>
        )}
        {activeLuckMultiplier < 1 && (
          <div style={{ padding: '0.1rem 0.4rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 0 5px var(--danger)', whiteSpace: 'nowrap' }} className="hebrew-text">
            ⚠️ פנצ'ר <span className="bidi-isolate">x0.5</span>
          </div>
        )}
      </div>

      {/* Right: decision meter */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }} className="hebrew-text">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--neon-purple)', fontWeight: 'bold', textShadow: '0 0 5px var(--neon-purple)' }}>
          <span>מד החלטה</span>
          <span className="bidi-isolate">{playerState.decisionMeter || 0}%</span>
        </div>
        <div className="decision-meter" style={{ width: '100%', height: '6px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--neon-purple)' }}>
          <div className="decision-fill" style={{ width: `${playerState.decisionMeter || 0}%`, height: '100%', background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }}></div>
        </div>
      </div>
    </div>

    {/* Race track */}
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      <RaceTrack participantsPositions={participantsPositions} currentUserId={playerState.id} />
    </div>
  </div>
);

export default StudentRaceHud;
