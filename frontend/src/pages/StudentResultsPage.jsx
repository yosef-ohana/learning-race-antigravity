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

  return (
    <div className="student-layout student-results-page-bg" style={{ overflow: 'hidden' }}>
      
      <div style={{ textAlign: 'center', margin: 'clamp(0.5rem, 3vh, 1.5rem) 0 0 0' }} className="hebrew-text">
        <h1 style={{ fontSize: 'clamp(2rem, 5vh, 3.5rem)', color: 'var(--neon-blue)', textShadow: '0 0 20px var(--neon-blue)', textTransform: 'uppercase', margin: 0 }}>המרוץ הסתיים!</h1>
        <h2 style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.3rem)', color: '#ccc', fontWeight: 'normal', margin: '0.2rem 0 0 0' }}>כל הכבוד למתחרים!</h2>
      </div>

      <div className="student-results-finish-banner">
        <div className="student-results-checkered-line"></div>
        <div className="student-results-finish-glow hebrew-text">
          🏁 המירוץ הסתיים 🏁
        </div>
        <div className="student-results-checkered-line"></div>
      </div>

      <div className="results-page-container">
        
        {/* Left Pane - Podium */}
        <div className="results-left-pane">
          
          <div className="podium-container">
            {podium[1] && (
              <div className="podium-column">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--neon-purple)', textShadow: '0 0 15px var(--neon-purple)', marginBottom: '0.4rem' }} className="bidi-isolate">2</div>
                
                <div style={{ marginBottom: '-6px', zIndex: 10 }}>
                  <CarIcon color={getParticipantColor(podium[1], results.leaderboard, 1)} width={60} height={30} />
                </div>

                <div className="podium-pedestal pedestal-2">
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', marginBottom: '0.3rem' }} className="hebrew-text">
                    {podium[1].displayName}{podium[1].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--neon-purple)', fontWeight: 'bold', marginBottom: '0.8rem' }} className="hebrew-text">
                    {podium[1].points} נק'
                  </div>
                  <div style={{ fontSize: '1.8rem' }}>🥈</div>
                </div>
              </div>
            )}
            
            {podium[0] && (
              <div className="podium-column">
                <div style={{ fontSize: '4.2rem', fontWeight: 'bold', color: 'var(--neon-orange)', textShadow: '0 0 18px var(--neon-orange)', marginBottom: '0.4rem' }} className="bidi-isolate">1</div>
                
                <div style={{ marginBottom: '-8px', zIndex: 10 }}>
                  <CarIcon color={getParticipantColor(podium[0], results.leaderboard, 0)} width={75} height={38} />
                </div>

                <div className="podium-pedestal pedestal-1">
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', marginBottom: '0.3rem' }} className="hebrew-text">
                    {podium[0].displayName}{podium[0].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--neon-orange)', fontWeight: 'bold', marginBottom: '0.8rem' }} className="hebrew-text">
                    {podium[0].points} נק'
                  </div>
                  <div style={{ fontSize: '2.2rem' }}>🏆</div>
                </div>
              </div>
            )}

            {podium[2] && (
              <div className="podium-column">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--neon-blue)', textShadow: '0 0 15px var(--neon-blue)', marginBottom: '0.4rem' }} className="bidi-isolate">3</div>
                
                <div style={{ marginBottom: '-6px', zIndex: 10 }}>
                  <CarIcon color={getParticipantColor(podium[2], results.leaderboard, 2)} width={60} height={30} />
                </div>

                <div className="podium-pedestal pedestal-3">
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', marginBottom: '0.3rem' }} className="hebrew-text">
                    {podium[2].displayName}{podium[2].isCurrentUser ? ' (אתה)' : ''}
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--neon-blue)', fontWeight: 'bold', marginBottom: '0.6rem' }} className="hebrew-text">
                    {podium[2].points} נק'
                  </div>
                  <div style={{ fontSize: '1.6rem' }}>🥉</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 'clamp(0.5rem, 2vh, 1.5rem)', display: 'flex', gap: '1rem' }}>
            <button className="option-btn hebrew-text" style={{ flex: 1, padding: 'clamp(0.5rem, 1.5vh, 1rem)', fontSize: 'clamp(0.9rem, 2.2vh, 1.2rem)', border: '2px solid var(--neon-purple)', color: 'var(--neon-purple)', boxShadow: 'none' }} onClick={() => {
              Cookies.remove(COOKIE_STUDENT_TOKEN);
              Cookies.remove(COOKIE_RACE_ID);
              navigate(ROUTES.STUDENT_JOIN);
            }}>
              🏠 חזור למסך הראשי
            </button>
          </div>
        </div>

        {/* Right Pane - Leaderboard */}
        <div className="results-right-pane">
          <div style={{ fontSize: 'clamp(1.1rem, 2.5vh, 1.5rem)', color: 'var(--neon-blue)', marginBottom: 'clamp(0.5rem, 1.5vh, 1rem)', borderBottom: '1px solid rgba(0, 243, 255, 0.3)', paddingBottom: 'clamp(0.3rem, 1vh, 0.8rem)', textAlign: 'center' }} className="hebrew-text">
            טבלת דירוג סופית
          </div>
          <Leaderboard leaderboard={results.leaderboard} variant="cyberpunk" />
        </div>

      </div>
    </div>
  );
};

export default StudentResultsPage;
