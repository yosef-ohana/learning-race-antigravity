import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import { fetchTeacherDashboardSnapshot } from '../services/api';

const TeacherRaceDashboardPage = () => {
  const { raceId } = useParams();
  const [snapshot, setSnapshot] = useState(null);
  const [sseError, setSseError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    if (!token) return navigate(ROUTES.TEACHER_LOGIN);

    let isMounted = true;

    const loadSnapshot = () => {
      fetchTeacherDashboardSnapshot(raceId)
        .then(res => {
          if (isMounted) {
            const data = res.data;
            setSnapshot(data);
            
            const isFinished = data.raceStatus === 'FINISHED';
            const someoneWon = data.leaderboard && data.leaderboard.some(competitor => competitor.position >= 1000);
            
            if (isFinished || someoneWon) {
              navigate(ROUTES.TEACHER_RESULTS(raceId));
            }
          }
        })
        .catch(err => console.error(err));
    };

    const evtSource = createSSEConnection('/subscribe-race-dashboard', { token, raceId }, {
      onOpen: () => {
        if (isMounted) {
          setSseError(false);
          loadSnapshot();
        }
      },
      onError: () => {
        if (isMounted) setSseError(true);
      },
      events: {
        'participant-progress-updated': () => {
          if (isMounted) loadSnapshot();
        },
        'race-finished': () => {
          if (isMounted) navigate(ROUTES.TEACHER_RESULTS(raceId));
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [raceId, navigate]);

  const handleFinishEarly = async () => {
    try {
      const token = Cookies.get(COOKIE_TEACHER_TOKEN);
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('raceId', raceId);
      await axios.post(`${API_BASE}/finish-race`, formData);
      navigate(ROUTES.TEACHER_RESULTS(raceId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!snapshot) return <div className="projector-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem' }}>INITIALIZING...</div>;

  return (
    <div className="projector-layout">
      {sseError && (
        <div className="overlay-blur" style={{ zIndex: 9999, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          <h1 style={{ fontSize: '5rem', margin: 0 }}>SYSTEM DISCONNECTED</h1>
          <p style={{ fontSize: '2rem' }}>RE-ESTABLISHING UPLINK...</p>
        </div>
      )}

      <div className="projector-header">
        <h1 className="projector-title">RACE TERMINAL: {raceId}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {!sseError && <div className="live-indicator">LIVE</div>}
          <button onClick={handleFinishEarly} className="option-btn" style={{ padding: '1rem', fontSize: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }}>
            FORCE OVERRIDE
          </button>
        </div>
      </div>

      <div className="projector-track">
        {snapshot.participantsPositions && snapshot.participantsPositions.map((p) => {
          const percent = Math.min(100, Math.max(0, (p.position / 1000) * 100)); // standard 1000 cap
          return (
            <div key={p.id} className="projector-lane">
              <div className="projector-lane-name">{p.displayName}</div>
              <div className="projector-lane-track">
                <div className="projector-lane-fill" style={{ width: `${percent}%` }}></div>
              </div>
              <div className="projector-lane-score">{p.points} PTS</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherRaceDashboardPage;
