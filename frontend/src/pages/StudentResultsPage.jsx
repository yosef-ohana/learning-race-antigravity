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
    <div className="student-layout" style={{ overflowY: 'auto' }}>
      
      <div style={{ textAlign: 'center', margin: '2rem 0 0 0' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--neon-blue)', textShadow: '0 0 20px var(--neon-blue)', textTransform: 'uppercase', margin: 0 }}>המרוץ הסתיים!</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#ccc', fontWeight: 'normal', margin: '0.5rem 0 0 0' }}>כל הכבוד לאלופים!</h2>
      </div>

      <div className="results-page-container">
        
        {/* Left Pane - Podium */}
        <div className="results-left-pane">
          
          <div className="podium-container">
            {podium[1] && (
              <div className="podium-block podium-rank-2">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--neon-purple)', textShadow: '0 0 15px var(--neon-purple)', marginBottom: '1rem' }}>2</div>
                
                <CarIcon color={getParticipantColor(podium[1], results.leaderboard, 1)} width={60} height={30} />

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{podium[1].displayName}{podium[1].isCurrentUser ? ' — אתה' : ''}</div>
                <div style={{ fontSize: '1.2rem', color: 'var(--neon-purple)' }}>{podium[1].points} נק'</div>
              </div>
            )}
            
            {podium[0] && (
              <div className="podium-block podium-rank-1">
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--neon-orange)', textShadow: '0 0 15px var(--neon-orange)', marginBottom: '1rem' }}>1</div>
                
                <CarIcon color={getParticipantColor(podium[0], results.leaderboard, 0)} width={70} height={35} />

                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{podium[0].displayName}{podium[0].isCurrentUser ? ' — אתה' : ''}</div>
                <div style={{ fontSize: '1.5rem', color: 'var(--neon-orange)', fontWeight: 'bold' }}>{podium[0].points} נק'</div>
                <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>🏆</div>
              </div>
            )}

            {podium[2] && (
              <div className="podium-block podium-rank-3">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--neon-blue)', textShadow: '0 0 15px var(--neon-blue)', marginBottom: '1rem' }}>3</div>
                
                <CarIcon color={getParticipantColor(podium[2], results.leaderboard, 2)} width={60} height={30} />

                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{podium[2].displayName}{podium[2].isCurrentUser ? ' — אתה' : ''}</div>
                <div style={{ fontSize: '1.2rem', color: 'var(--neon-blue)' }}>{podium[2].points} נק'</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
            <button className="option-btn" style={{ flex: 1, padding: '1rem', fontSize: '1.2rem', border: '2px solid var(--neon-purple)', color: 'var(--neon-purple)', boxShadow: 'none' }} onClick={() => {
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
          <div style={{ fontSize: '1.5rem', color: 'var(--neon-blue)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 243, 255, 0.3)', paddingBottom: '0.8rem', textAlign: 'center' }}>
            טבלת דירוג סופית
          </div>
          <Leaderboard leaderboard={results.leaderboard} variant="cyberpunk" />
        </div>

      </div>
    </div>
  );
};

export default StudentResultsPage;
