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
    2: '#ff00ff', 
    3: 'var(--neon-blue)' 
  };
  const color = colors[place] || 'var(--neon-blue)';
  const height = place === 1 ? 'clamp(120px, 20vh, 180px)' : 'clamp(100px, 17vh, 150px)';
  const width = place === 1 ? 'clamp(130px, 15vw, 170px)' : 'clamp(110px, 13vw, 150px)';
  const marginTop = place === 1 ? '0' : 'clamp(10px, 2.5vh, 25px)';
  const carWidth = place === 1 ? 90 : 80;
  const carHeight = place === 1 ? 45 : 40;

  return (
    <div className={`t-podium-item place-${place}`} style={{ width, height, marginTop, borderColor: color, boxShadow: `0 0 20px ${color}33, inset 0 0 20px ${color}33` }}>
      <div className="t-podium-badge" style={{ borderColor: color, color: color, textShadow: `0 0 10px ${color}` }}>
        {place}
      </div>
      <div className="t-podium-name">{data.displayName}</div>
      <div className="t-podium-points" style={{ color: color, textShadow: `0 0 5px ${color}` }}>{data.points}</div>
      
      <div className="t-podium-car">
        <CarIcon color={getParticipantColor(data, leaderboard, place - 1)} width={carWidth} height={carHeight} />
      </div>
      <div className="t-podium-glow-base" style={{ background: color, boxShadow: `0 0 30px ${color}` }}></div>
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
    <div className="dashboard-container t-results-page teacher-results-page-bg" style={{ direction: 'rtl', overflow: 'hidden' }}>
      <div className="join-page-bg"></div>

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

      <div className="t-results-content">
        
        <div className="t-podium-section">
          <div className="t-podium-header">
            <h1 className="t-podium-title">
              המרוץ הסתיים!
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="gold" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}><path d="M8 21h8m-4-4v4m-5-4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </h1>
            {results.winner && <p className="t-podium-subtitle">המנצח: {results.winner.displayName}</p>}
          </div>
          
          <div className="t-podium-grid">
            {second && <PodiumItem place={2} data={second} leaderboard={results.leaderboard} />}
            {first && <PodiumItem place={1} data={first} leaderboard={results.leaderboard} />}
            {third && <PodiumItem place={3} data={third} leaderboard={results.leaderboard} />}
          </div>
          
          {results.summaryStats && (
            <div style={{ textAlign: 'center', color: 'var(--neon-green)', fontSize: 'clamp(0.95rem, 1.8vh, 1.15rem)', marginTop: '0.8rem' }}>
              {results.summaryStats.replace("Race completed with", "המרוץ הושלם בהצלחה בהשתתפות").replace("participants.", "משתתפים.")}
            </div>
          )}
        </div>

        <div className="t-results-table-section">
          <h2 className="t-results-table-title">תוצאות סופיות</h2>
          <Leaderboard leaderboard={sortedLeaderboard} variant="teacher-table" />
        </div>

      </div>
    </div>
  );
};

export default TeacherResultsPage;
