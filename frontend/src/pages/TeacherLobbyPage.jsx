import React, { useState, useEffect } from 'react';
import ParticipantList from '../components/ParticipantList';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';

const TeacherLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobby, setLobby] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) {
      navigate(ROUTES.TEACHER_LOGIN);
      return;
    }

    let isMounted = true;

    const fetchLobby = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-race-lobby`, { params: { token, raceId } });
        if (isMounted) setLobby(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    const evtSource = createSSEConnection('/subscribe-race-dashboard', { token, raceId }, {
      onOpen: () => {
        if (isMounted) fetchLobby();
      },
      events: {
        'lobby-participants-updated': () => {
          if (isMounted) fetchLobby();
        },
        'participant-progress-updated': () => {
          if (isMounted) fetchLobby();
        },
        'race-started': () => {
          if (isMounted) fetchLobby();
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [navigate]);

  const handleStart = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
      formData.append('raceId', Cookies.get(COOKIE_RACE_ID));
      const res = await axios.post(`${API_BASE}/start-race`, formData);
      if (res.data.success) {
        navigate(ROUTES.TEACHER_DASHBOARD(Cookies.get(COOKIE_RACE_ID)));
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!lobby) return (
    <div className="join-page-container" style={{ direction: 'rtl' }}>
      <div className="join-page-bg"></div>
      <div className="overlay-blur" style={{ zIndex: 999 }}>
        <h1 className="join-title">טוען חדר המתנה...</h1>
      </div>
    </div>
  );

  const participantsCount = lobby.participantsCount || (lobby.participants ? lobby.participants.length : 0);

  return (
    <div className="join-page-container" style={{ direction: 'rtl' }}>
      <div className="join-page-bg"></div>

      {/* TOP HEADER */}
      <div className="dashboard-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottom: 'none', background: 'transparent', padding: '0.5rem 2rem' }}>
        <div style={{ width: '50px' }}></div>
        <div className="dashboard-brand" style={{ alignItems: 'center' }}>
          <h1 className="join-title" style={{ fontSize: '2rem', margin: 0, justifyContent: 'center' }}>
            Math Race
            <div className="checkered-flag-icon" style={{ transform: 'skewX(-15deg) scale(0.55)', marginLeft: '5px' }}>
              <div/><div/><div/><div/><div/><div/><div/><div/><div/>
            </div>
          </h1>
          <div className="join-subtitle" style={{ fontSize: '0.8rem', marginTop: '2px' }}>מרוץ חשבון חווייתי בזמן אמת</div>
        </div>
        <div style={{ width: '50px' }}></div>
      </div>

      <div className="t-lobby-content">
        {/* Left Panel */}
        <div className="t-lobby-left-panel">
          <div className="t-lobby-title-area">
            <h1 className="t-lobby-main-title">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              חדר המתנה
            </h1>
            <p className="t-lobby-subtitle">חבר את התלמידים שלך והתחל את המרוץ!</p>
          </div>

          <div className="t-lobby-stats-row">
            <div className="t-lobby-code-box">
              <div className="t-code-label">קוד החדר</div>
              <div className="t-code-val">{raceCode}</div>
              <div className="t-code-share">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                שתף קוד לחיבור
              </div>
            </div>
            
            <div className="t-lobby-count-box">
              <div className="t-count-circle">
                <div className="t-count-val">{participantsCount}/8</div>
                <div className="t-count-label">משתתפים</div>
              </div>
            </div>
          </div>

          <div className="t-lobby-roster-area">
            <div className="t-roster-title">
              <span className="t-roster-title-line"></span>
              משתתפים בחדר
              <span className="t-roster-title-line"></span>
            </div>
            
            <ParticipantList participants={lobby.participants} variant="teacher" />
          </div>

          <button className={`t-btn-start ${!lobby.canStart ? 'disabled' : ''}`} disabled={!lobby.canStart} onClick={handleStart}>
            התחל מרוץ
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
        </div>

        {/* Right Panel */}
        <div className="t-lobby-right-panel">
          <div className="t-info-block">
            <h3 className="t-info-title">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '15px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              איך מצטרפים?
            </h3>
            <p>התלמידים פותחים את האתר</p>
            <p className="t-info-link">mathrace.live</p>
            <p>ומזינים את קוד החדר</p>
          </div>
          
          <div className="t-info-divider"></div>
          
          <div className="t-info-block">
            <h3 className="t-info-title">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '15px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              החדר פתוח
            </h3>
            <p>החדר ייסגר אוטומטית</p>
            <p>עם התחלת המרוץ</p>
          </div>

          <div className="t-info-divider"></div>

          <div className="t-info-block t-info-flag">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '15px' }}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
            הכן, הכן... מרוץ!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLobbyPage;
