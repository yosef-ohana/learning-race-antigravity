import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import { fetchTeacherDashboardSnapshot, finishRace } from '../services/api';
import RaceTrack from '../components/RaceTrack';

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

  if (!snapshot) return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h1 className="join-title">טוען לוח בקרה...</h1>
    </div>
  );

  const participantsCount = snapshot.participantsPositions?.length || 0;

  return (
    <div className="dashboard-container">
      <div className="join-page-bg"></div>
      
      {sseError && (
        <div className="overlay-blur dashboard-error" style={{ zIndex: 9999 }}>
          <h1 className="error-title" style={{ fontSize: '5rem', color: 'var(--danger)', margin: 0 }}>החיבור נותק</h1>
          <p className="error-subtitle" style={{ fontSize: '2rem', color: 'var(--danger)' }}>מנסה להתחבר מחדש...</p>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="dashboard-header">
        
        {/* Left: Branding */}
        <div className="dashboard-brand">
          <h1 className="join-title" style={{ fontSize: '3rem', margin: 0, justifyContent: 'flex-start' }}>
            Math Race
            <div className="checkered-flag-icon" style={{ transform: 'skewX(-15deg) scale(0.7)', marginLeft: '5px' }}>
              <div/><div/><div/>
              <div/><div/><div/>
              <div/><div/><div/>
            </div>
          </h1>
          <div className="join-subtitle" style={{ fontSize: '1rem', marginTop: '5px', justifyContent: 'flex-start' }}>מרוץ חשבון חווייתי בזמן אמת</div>
        </div>

        {/* Middle: Stats panel */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <div>
              <div className="stat-label">משתתפים</div>
              <div className="stat-val" style={{ direction: 'rtl' }}>{participantsCount} / 8</div>
            </div>
          </div>
          
          <div className="dashboard-stat-divider"></div>
          
          <div className="dashboard-stat-item">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <div>
              <div className="stat-label">קוד חדר</div>
              <div className="stat-val">{raceId}</div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="dashboard-actions">
          <button onClick={handleFinishEarly} className="btn-stop-race">
            <div className="stop-square"></div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>סיום מרוץ</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>לחץ לעצירת המרוץ</div>
            </div>
          </button>
        </div>
      </div>

      <div className="dashboard-track-header">
        <span className="track-header-text">התקדמות למסלול</span>
      </div>

      <div className="dashboard-main-content">
        <div className="track-finish-line-pattern"></div>
        <RaceTrack participantsPositions={snapshot.participantsPositions} currentUserId={null} variant="dashboard" />
      </div>

      <div className="dashboard-footer">
        <div className="footer-status">
          <span className={sseError ? "status-dot red" : "status-dot green"}></span>
          {sseError ? "מנותק" : "שידור חי / מחובר"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}>
            <path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: 'var(--neon-blue)', letterSpacing: '10px', opacity: 0.5 }}>
          לוח בקרה חי למורה
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div className="footer-updated">
            מעודכן לאחרונה: עכשיו
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="footer-settings">
            הגדרות
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRaceDashboardPage;
