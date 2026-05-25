import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import ParticipantList from '../components/ParticipantList';

const StudentLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobbyState, setLobbyState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) {
      navigate(ROUTES.STUDENT_JOIN);
      return;
    }

    let isMounted = true;

    const checkState = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-student-race-state`, { params: { token, raceId } });
        if (isMounted) {
          setLobbyState(res.data);
          if (res.data.raceStatus === 'LIVE' || res.data.raceStatus === 'ACTIVE') {
            navigate(ROUTES.STUDENT_RACE(raceId));
          } else if (res.data.raceStatus === 'FINISHED') {
            navigate(ROUTES.STUDENT_RESULTS(raceId));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const evtSource = createSSEConnection('/subscribe-student-race', { token, raceId }, {
      onOpen: () => {
        if (isMounted) checkState();
      },
      events: {
        'lobby-participants-updated': () => {
          if (isMounted) checkState();
        },
        'race-started': () => {
          if (isMounted) checkState();
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [navigate]);

  const participantsCount = lobbyState ? (lobbyState.participantsCount || lobbyState.participantsPositions?.length || 0) : 0;
  const participantsList = lobbyState?.participantsPositions || [];

  return (
    <div className="join-page-container">
      <div className="join-page-bg"></div>
      
      <div className="join-header">
        <h1 className="join-title">
          Math Race
          <div className="checkered-flag-icon">
            <div/><div/><div/>
            <div/><div/><div/>
            <div/><div/><div/>
          </div>
        </h1>
        <div className="join-subtitle">מרוץ חשבון חווייתי בזמן אמת</div>
      </div>

      <div className="join-card lobby-card">
        <h2>מחכים לתחילת המירוץ</h2>
        <p className="lobby-subtitle">נרשמת בהצלחה! המורה יתחיל את המירוץ בקרוב</p>
        
        <div className="lobby-loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <div className="lobby-panels">
          <div className="lobby-panel-left">
            <h3 className="lobby-panel-title">פרטי החדר</h3>
            <div className="lobby-detail-row">
              <div className="lobby-detail-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                קוד חדר:
              </div>
              <div className="lobby-detail-value">{raceCode}</div>
            </div>
            <div className="lobby-status-badges">
              <span className="lobby-badge badge-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                מחובר
              </span>
              <span className="lobby-badge badge-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                מוכן
              </span>
            </div>
          </div>

          <div className="lobby-panel-right">
            <h3 className="lobby-panel-title">משתתפים בחדר</h3>
            <div className="lobby-participant-count">{participantsCount} משתתפים הצטרפו</div>
            <ParticipantList participants={participantsList} />
          </div>
        </div>

        <div className="lobby-how-it-works">
          <div className="lobby-how-it-works-title"><span>כך זה עובד</span></div>
          <div className="lobby-instructions">
            <div className="instruction-box">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <h4>ענו מהר כדי להתקדם</h4>
              <p>כל תשובה נכונה מקדמת אתכם צעד נוסף במסלול</p>
            </div>
            <div className="instruction-box">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18v-6a3 3 0 0 1 3-3h10"></path><polyline points="18 5 22 9 18 13"></polyline>
                <path d="M9 18v-6a3 3 0 0 0-3-3H2"></path>
              </svg>
              <h4>בצומת תבחרו מסלול</h4>
              <p>בחרו את המסלול הנכון כדי לקבל יותר נקודות ולהקדים את היריבים</p>
            </div>
            <div className="instruction-box">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
              <h4>בונוסים יכולים לעזור לכם</h4>
              <p>אספו בונוסים לאורך המסלול וקבלו יתרון משמעותי</p>
            </div>
          </div>
        </div>

      </div>
      
      <div className="lobby-footer-msg">המירוץ יתחיל אוטומטית כאשר המורה יפעיל אותו</div>
    </div>
  );
};

export default StudentLobbyPage;
