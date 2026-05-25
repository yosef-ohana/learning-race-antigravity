import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import { fetchTeacherDashboardSnapshot, finishRace } from '../services/api';
import RaceTrack from '../components/RaceTrack';
import Leaderboard from '../components/Leaderboard';

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
            
            if (data.raceStatus === 'FINISHED') {
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
        'race-started': () => {
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
    if (!window.confirm("האם אתה בטוח שברצונך לסיים את המרוץ?")) return;
    try {
      await finishRace(raceId);
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
            סיום מרוץ
          </button>
        </div>
      </div>

      <div className="projector-track" style={{ marginTop: '2rem' }}>
        <RaceTrack participantsPositions={snapshot.participantsPositions} currentUserId={null} />
      </div>

      <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '10px' }}>
        <h2 style={{ color: 'var(--neon-blue)', marginTop: 0 }}>LIVE LEADERBOARD</h2>
        <Leaderboard leaderboard={snapshot.leaderboard || snapshot.participantsPositions} />
      </div>
    </div>
  );
};

export default TeacherRaceDashboardPage;
