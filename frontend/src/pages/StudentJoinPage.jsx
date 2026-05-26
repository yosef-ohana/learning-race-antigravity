import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentJoinPage = () => {
  const [raceCode, setRaceCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('raceCode', raceCode.toUpperCase());
      formData.append('displayName', displayName);

      const res = await axios.post(`${API_BASE}/join-race`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_STUDENT_TOKEN, res.data.studentToken);
        Cookies.set(COOKIE_RACE_ID, res.data.raceId);
        navigate(ROUTES.STUDENT_LOBBY(res.data.raceCode));
      } else {
        setError(res.data.message || 'שגיאה בהצטרפות');
      }
    } catch (err) {
      setError('ההצטרפות נכשלה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-page-container">
      <div className="join-page-bg"></div>
      
      <div className="join-header">
        <h1 className="join-title bidi-isolate" style={{ direction: 'ltr' }}>
          Math Race
          <div className="checkered-flag-icon">
            <div/><div/><div/>
            <div/><div/><div/>
            <div/><div/><div/>
          </div>
        </h1>
        <div className="join-subtitle hebrew-text">מרוץ חשבון חווייתי בזמן אמת</div>
      </div>

      <div className="join-card hebrew-text">
        <h2>הצטרפות למירוץ</h2>
        <p>היכנסו, הצטרפו לחדר והתחילו לשחק!</p>
        
        {error && (
          <div className="glow-card-danger hebrew-text" style={{ 
            marginBottom: '1.5rem', 
            color: '#ffaa00', 
            border: '1px solid #ffaa00', 
            padding: '10px', 
            borderRadius: '8px', 
            background: 'rgba(255,170,0,0.1)' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleJoin}>
          <div className="join-input-group">
            <input 
              type="text" 
              className="join-input hebrew-text"
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              placeholder="שם תלמיד" 
              required 
              disabled={isLoading}
            />
            <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          
          <div className="join-input-group">
            <input 
              type="text" 
              className="join-input hebrew-text"
              value={raceCode} 
              onChange={e => setRaceCode(e.target.value)} 
              placeholder="קוד חדר" 
              required 
              disabled={isLoading}
            />
            <svg className="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </div>

          <button type="submit" className="join-btn hebrew-text" disabled={isLoading}>
            <span style={{ fontSize: '1.2rem', opacity: 0.8 }} className="bidi-isolate">&lt;&lt;</span>
            <span>{isLoading ? 'מתחבר...' : 'הצטרפות למירוץ'}</span>
            <span style={{ fontSize: '1.2rem', opacity: 0.8 }} className="bidi-isolate">&gt;&gt;</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentJoinPage;
