import React, { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import CarIcon, { getParticipantColor } from '../components/CarIcon';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const PodiumItem = ({ place, data, leaderboard }) => {
  if (!data) return null;
  const colors = {
    1: 'var(--neon-orange)', 
    2: 'var(--neon-purple)', 
    3: 'var(--neon-orange)' 
  };
  const color = colors[place] || 'var(--neon-blue)';
  const width = place === 1 ? 'clamp(150px, 18vw, 200px)' : 'clamp(130px, 15vw, 170px)';
  const carWidth = place === 1 ? 110 : 90;
  const carHeight = place === 1 ? 55 : 45;

  return (
    <div className={`tr-podium-item place-${place}`} style={{ width }}>
      <div className="tr-podium-card" style={{ borderColor: color, boxShadow: `0 0 20px ${color}33, inset 0 0 20px ${color}33` }}>
        <div className="tr-podium-rank" style={{ borderColor: color, color: '#fff', textShadow: `0 0 10px ${color}`, boxShadow: `0 0 10px ${color}, inset 0 0 5px ${color}` }}>
          {place}
        </div>
        <div className="tr-podium-name hebrew-text">{data.displayName}</div>
        <div className="tr-podium-score hebrew-text" style={{ color: color, textShadow: `0 0 5px ${color}` }}>{data.points}</div>
        <div className="tr-podium-car">
          <CarIcon color={getParticipantColor(data, leaderboard, place - 1)} width={carWidth} height={carHeight} />
        </div>
      </div>
      <div className="tr-podium-base" style={{ background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)` }}></div>
    </div>
  );
};

const TeacherResultsPage = () => {
  const { raceId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    if (!token) return navigate(ROUTES.TEACHER_LOGIN);

    axios.get(`${API_BASE}/get-race-results`, { params: { token, raceId } })
      .then(res => setResults(res.data))
      .catch(err => console.error(err));
  }, [raceId, navigate]);

  if (!results) return (
    <div className="dashboard-container" style={{ direction: 'rtl' }}>
      <div className="join-page-bg"></div>
      <div className="overlay-blur" style={{ zIndex: 999 }}>
        <h1 className="join-title">טוען תוצאות...</h1>
      </div>
    </div>
  );

  const sortedLeaderboard = results.leaderboard ? [...results.leaderboard].sort((a, b) => (a.rank || 0) - (b.rank || 0)) : [];
  const first = sortedLeaderboard[0];
  const second = sortedLeaderboard[1];
  const third = sortedLeaderboard[2];

  return (
    <div className="dashboard-container teacher-results-page-bg" style={{ direction: 'rtl', overflow: 'hidden' }}>
      
      {/* TOP HEADER */}
      <div className="dashboard-header" style={{ position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)' }}>
        
        {/* Right Action (Back to lobby equivalent) */}
        <div className="dashboard-actions">
          <button onClick={() => navigate(ROUTES.TEACHER_CREATE_RACE)} className="btn-stop-race" style={{ borderColor: 'var(--neon-blue)', background: 'rgba(0,150,255,0.1)', boxShadow: '0 0 20px rgba(0,150,255,0.3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)', marginRight: '10px' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>משחק נוסף</div>
            </div>
          </button>
        </div>

        {/* Center Brand */}
        <div className="dashboard-brand" style={{ alignItems: 'center' }}>
          <h1 className="join-title" style={{ fontSize: '2.5rem', margin: 0, justifyContent: 'center' }}>
            Math Race
            <div className="checkered-flag-icon" style={{ transform: 'skewX(-15deg) scale(0.6)', marginLeft: '5px' }}>
              <div/><div/><div/><div/><div/><div/><div/><div/><div/>
            </div>
          </h1>
          <div className="join-subtitle" style={{ fontSize: '0.9rem', marginTop: '2px' }}>מרוץ חשבון חווייתי בזמן אמת</div>
        </div>
        
        {/* Left Spacer */}
        <div style={{ width: '150px' }}></div>
      </div>

      <div className="tr-content-wrapper">
        
        {/* Left Column: Podium & Table */}
        <div className="tr-left-column">
          
          <div className="tr-winners-section">
            <div className="tr-podium-header hebrew-text">
              <h1><span style={{color: 'gold', filter: 'drop-shadow(0 0 5px gold)'}}>🏆</span> המרוץ הסתיים! <span style={{color: 'gold', filter: 'drop-shadow(0 0 5px gold)'}}>🏆</span></h1>
              {results.winner && <p>כל הכבוד למנצחים!</p>}
            </div>
            
            <div className="tr-podium-container">
              {second && <PodiumItem place={2} data={second} leaderboard={results.leaderboard} />}
              {first && <PodiumItem place={1} data={first} leaderboard={results.leaderboard} />}
              {third && <PodiumItem place={3} data={third} leaderboard={results.leaderboard} />}
            </div>

            {results.summaryStats && (
              <div style={{ textAlign: 'center', color: 'var(--neon-green)', fontSize: 'clamp(0.95rem, 1.8vh, 1.15rem)', marginTop: '0.8rem' }} className="hebrew-text">
                {results.summaryStats.replace("Race completed with", "המרוץ הושלם בהצלחה בהשתתפות").replace("participants.", "משתתפים.")}
              </div>
            )}
          </div>

          <div className="tr-table-section">
            <h2 className="tr-table-title hebrew-text">תוצאות סופיות</h2>
            <div className={`tr-table-wrapper ${sortedLeaderboard.length <= 4 ? 'few-participants' : sortedLeaderboard.length >= 8 ? 'many-participants' : 'normal-participants'}`}>
              <Leaderboard leaderboard={sortedLeaderboard} variant="teacher-table" />
            </div>
          </div>

        </div>

        {/* Right Column: Batch 10R (Per-student stats) */}
        <div className="tr-right-column">
          <div className="tr-stats-panel hebrew-text">
            <h2 className="tr-stats-title">סטטיסטיקות תלמידים</h2>
            <div className="tr-stats-list">
              {sortedLeaderboard.map(participant => (
                <div key={participant.userId} className="tr-stat-participant-card">
                  <div className="tr-stat-header">
                    <span className="tr-stat-rank">{participant.rank}</span>
                    <span className="tr-stat-name">{participant.displayName}</span>
                  </div>
                  <div className="tr-stat-metrics">
                    <div className="tr-metric">
                      <span className="tr-metric-label">דיוק:</span>
                      <span className="tr-metric-value">{participant.accuracyPercent ?? 0}%</span>
                    </div>
                    <div className="tr-metric">
                      <span className="tr-metric-label">נכונות:</span>
                      <span className="tr-metric-value">{participant.correctAnswersCount ?? 0}/{participant.answeredQuestionsCount ?? 0}</span>
                    </div>
                    <div className="tr-metric">
                      <span className="tr-metric-label">זמן ממוצע:</span>
                      <span className="tr-metric-value">{participant.averageAnswerTimeSeconds ?? 0} שניות</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TeacherResultsPage;
