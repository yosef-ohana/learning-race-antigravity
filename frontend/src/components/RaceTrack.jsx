import React from 'react';
import { TRACK_LENGTH } from '../config/Constants';
import CarIcon, { getParticipantColor } from './CarIcon';

const RaceTrack = ({ participantsPositions, currentUserId, variant = 'standard' }) => {
  if (!participantsPositions || participantsPositions.length === 0) return null;

  if (variant === 'dashboard') {

    return (
      <div className="dashboard-track-list">
        <div className="track-finish-line-pattern"></div>
        {participantsPositions.map((p, idx) => {
          const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100));
          const rank = p.rank || idx + 1;
          const color = getParticipantColor(p, participantsPositions, idx);

          return (
            <div key={p.id} className="dashboard-track-row" style={{ borderLeft: `4px solid ${color}`, boxShadow: `inset 10px 0 20px -10px ${color}` }}>
              
              <div className="dash-rank" style={{ color: color, textShadow: `0 0 10px ${color}` }}>
                {rank === 1 ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/><path d="M16 3h-8v4h8V3z"/></svg>
                ) : rank === 2 ? (
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-3 3h6l-3-3z"/><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ) : rank === 3 ? (
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-3 3h6l-3-3z"/><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ) : (
                  <div className="dash-rank-circle" style={{ borderColor: color }}>{rank}</div>
                )}
              </div>

              <div className="dash-avatar">
                <svg width="36" height="36" viewBox="0 0 24 24" fill={color} style={{ opacity: 0.8 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>

              <div className="dash-info">
                <div className="dash-name">{p.displayName}</div>
                <div className="dash-points" style={{ color: color }}>{p.points} נק'</div>
              </div>

              <div className="dash-bar-container">
                <div className="dash-bar-bg"></div>
                <div className="dash-bar-fill" style={{ width: `${percent}%`, left: 0, background: `linear-gradient(90deg, transparent, ${color})`, boxShadow: `5px 0 15px ${color}` }}></div>
                
                <div className="dash-car" style={{ left: `calc(${percent}% - 25px)`, top: '50%', transform: 'translateY(-50%)' }}>
                  <CarIcon color={color} width={50} height={25} />
                </div>
              </div>

              <div className="dash-percent" style={{ color: color }}>
                {Math.round(percent)}%
              </div>

            </div>
          );
        })}
      </div>
    );
  }

  // Student standard rendering — visually aligned with teacher dashboard
  const count = participantsPositions.length;
  return (
    <div className="student-track-list" style={{ '--participant-count': count }}>
      {participantsPositions.map((p, idx) => {
        const percent = Math.min(95, Math.max(0, (p.position / TRACK_LENGTH) * 100));
        const isMe = p.id === currentUserId;
        const color = getParticipantColor(p, participantsPositions, idx);
        const rank = p.rank || idx + 1;

        return (
          <div
            key={p.id}
            className={`student-track-row${isMe ? ' student-track-row--me' : ''}`}
            style={{ borderLeft: `4px solid ${color}`, boxShadow: `inset 10px 0 20px -10px ${color}` }}
          >
            {/* Rank badge */}
            <div className="student-track-rank" style={{ color: color, borderColor: color }}>
              {rank}
            </div>

            {/* Name + "אתה" tag */}
            <div className="student-track-info">
              <div className="student-track-name">{p.displayName}</div>
              {isMe && <div className="student-track-me-tag" style={{ color: color, borderColor: color }}>אתה</div>}
            </div>

            {/* Progress bar + car */}
            <div className="student-track-bar-container">
              <div className="student-track-bar-bg" />
              <div
                className="student-track-bar-fill"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, transparent, ${color})`,
                  boxShadow: `5px 0 15px ${color}`
                }}
              />
              <div className="student-track-car" style={{ left: `calc(${percent}% - 20px)` }}>
                <CarIcon color={color} width={40} height={20} />
              </div>
              {/* Finish line marker */}
              <div className="student-track-finish-line" />
            </div>

            {/* Points */}
            <div className="student-track-points" style={{ color: color }}>
              {p.points} נק'
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RaceTrack;

