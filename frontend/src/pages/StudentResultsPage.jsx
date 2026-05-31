import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import Button from '../components/Button';
import CarIcon, { getParticipantColor } from '../components/CarIcon';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentResultsPage = () => {
  const { raceId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    if (!token) return navigate(ROUTES.STUDENT_JOIN);

    axios.get(`${API_BASE}/get-race-results`, { params: { token, raceId } })
      .then(res => setResults(res.data))
      .catch(err => console.error(err));
  }, [raceId, navigate]);

  if (!results) return <div className="student-layout" style={{ justifyContent: 'center', alignItems: 'center', fontSize: '2rem', color: 'var(--neon-blue)' }}>טוען תוצאות...</div>;

  const podium = results.leaderboard ? results.leaderboard.slice(0, 3) : [];
  const currentUserEntry = results.leaderboard ? results.leaderboard.find(entry => entry.isCurrentUser) : null;

  return (
    <div className="student-layout student-results-page-bg">
      <div className="results-page-wrapper">
        
        {/* Left Pane - Podium */}
        <div className="sr-left-pane">
          
          <div className="sr-header hebrew-text">
            <h1><span style={{color: 'var(--neon-purple)', filter: 'hue-rotate(240deg)'}}>🏆</span> מרוץ הסתיים! <span style={{color: 'var(--neon-purple)', filter: 'hue-rotate(240deg)'}}>🏆</span></h1>
            <h2>כל הכבוד למנצחים!</h2>
          </div>

          <div className="sr-podium-container">
            {podium[1] && (
              <div className="sr-podium-column">
                <div className="sr-place-number num-2 bidi-isolate">2</div>
                
                <div className="sr-car-wrapper">
                  <CarIcon color={getParticipantColor(podium[1], results.leaderboard, 1)} width={80} height={40} />
                </div>

                <div className="sr-pedestal sr-pedestal-2">
                  <div className="sr-pedestal-name hebrew-text">
                    {podium[1].displayName}{podium[1].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div className="sr-pedestal-score score-2 hebrew-text">
                    {podium[1].points}
                  </div>
                  <div className="sr-pedestal-trophy">🥈</div>
                </div>
              </div>
            )}
            
            {podium[0] && (
              <div className="sr-podium-column" style={{ zIndex: 5, marginBottom: '20px' }}>
                <div className="sr-place-number num-1 bidi-isolate">1</div>
                
                <div className="sr-car-wrapper">
                  <CarIcon color={getParticipantColor(podium[0], results.leaderboard, 0)} width={110} height={55} />
                </div>

                <div className="sr-pedestal sr-pedestal-1">
                  <div className="sr-pedestal-name hebrew-text">
                    {podium[0].displayName}{podium[0].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div className="sr-pedestal-score score-1 hebrew-text">
                    {podium[0].points}
                  </div>
                  <div className="sr-pedestal-trophy">🏆</div>
                </div>
              </div>
            )}

            {podium[2] && (
              <div className="sr-podium-column">
                <div className="sr-place-number num-3 bidi-isolate">3</div>
                
                <div className="sr-car-wrapper">
                  <CarIcon color={getParticipantColor(podium[2], results.leaderboard, 2)} width={80} height={40} />
                </div>

                <div className="sr-pedestal sr-pedestal-3">
                  <div className="sr-pedestal-name hebrew-text">
                    {podium[2].displayName}{podium[2].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div className="sr-pedestal-score score-3 hebrew-text">
                    {podium[2].points}
                  </div>
                  <div className="sr-pedestal-trophy">🥉</div>
                </div>
              </div>
            )}
          </div>

          {currentUserEntry ? (
            <div className="sr-stats-container">
              <div className="sr-stat-card">
                <div className="sr-stat-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--neon-blue)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px var(--neon-blue))' }}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="sr-stat-info hebrew-text">
                  <span className="sr-stat-label">דיוק כללי</span>
                  <span className="sr-stat-value">{(currentUserEntry.accuracyPercent ?? 0)}%</span>
                </div>
              </div>

              <div className="sr-stat-card">
                <div className="sr-stat-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--neon-orange)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px var(--neon-orange))' }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="sr-stat-info hebrew-text">
                  <span className="sr-stat-label">שאלות נכונות</span>
                  <span className="sr-stat-value">
                    {(currentUserEntry.correctAnswersCount ?? 0)}/{(currentUserEntry.answeredQuestionsCount ?? 0)}
                  </span>
                </div>
              </div>

              <div className="sr-stat-card">
                <div className="sr-stat-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--neon-blue)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px var(--neon-blue))' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                    <path d="M12 2v2" />
                  </svg>
                </div>
                <div className="sr-stat-info hebrew-text">
                  <span className="sr-stat-label">זמן ממוצע לשאלה</span>
                  <span className="sr-stat-value">{(currentUserEntry.averageAnswerTimeSeconds ?? 0)} שניות</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="sr-error-container hebrew-text">
              <span className="sr-error-msg">לא נמצאו נתוני משתמש למרוץ זה</span>
            </div>
          )}

          <div className="sr-actions">
            <button className="sr-btn hebrew-text" onClick={() => {
              Cookies.remove(COOKIE_STUDENT_TOKEN);
              Cookies.remove(COOKIE_RACE_ID);
              navigate(ROUTES.STUDENT_JOIN);
            }}>
              🏠 חזרה ללובי
            </button>
          </div>

        </div>

        {/* Right Pane - Leaderboard */}
        <div className="sr-right-pane">
          <div className="sr-right-title hebrew-text">תוצאות סופיות</div>
          
          <div className="sr-right-headers hebrew-text">
            <span style={{ width: '80px', textAlign: 'center' }}>מקום</span>
            <span style={{ flex: 1, paddingRight: '1.5rem' }}>שחקן</span>
            <span style={{ width: '80px', textAlign: 'left', paddingLeft: '1rem' }}>נקודות</span>
          </div>

          <div className={`sr-leaderboard-wrapper ${results.leaderboard && results.leaderboard.length <= 4 ? 'few-participants' : results.leaderboard && results.leaderboard.length >= 8 ? 'many-participants' : 'normal-participants'}`}>
            <Leaderboard leaderboard={results.leaderboard} variant="cyberpunk" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentResultsPage;
