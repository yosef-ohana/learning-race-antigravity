import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Input from '../components/Input';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const TeacherLoginPage = () => {
  const [username, setUsername] = useState('teacher');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('usernameOrEmail', username);
      formData.append('password', password);

      const res = await axios.post(`${API_BASE}/teacher-login`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_TEACHER_TOKEN, res.data.token);
        navigate(ROUTES.TEACHER_CREATE_RACE);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('ההתחברות נכשלה.');
    }
  };

  return (
    <div className="teacher-login-page teacher-login-wrapper">
      {/* Cyberpunk Header */}
      <header className="cyber-header">
        <div className="logo-container">
          {/* Custom Math-accented Neon Trophy SVG Silhouette */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 8px var(--neon-purple))' }}>
            <path d="M6 4h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V4z" stroke="var(--neon-purple)" strokeWidth="2" strokeLinejoin="round" fill="rgba(188, 19, 254, 0.1)"/>
            <path d="M6 6H3v3c0 2 1.5 3 3 3.5V6zm12 0h3v3c0 2-1.5 3-3 3.5V6z" stroke="var(--neon-purple)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16v5M8 21h8" stroke="var(--neon-purple)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 7.5h4M12 5.5v4" stroke="#00f3ff" strokeWidth="1.5" strokeLinecap="round"/> {/* + */}
            <path d="M10 11.5h4" stroke="#00f3ff" strokeWidth="1.5" strokeLinecap="round"/> {/* - */}
          </svg>
          <div className="logo-text-stack">
            <span className="logo-title-main">MATH RACE</span>
            <span className="logo-subtitle-sub">INNOVATIVE LEARNING RACE</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="cyber-btn-logout user-change">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>שינוי משתמש</span>
        </button>
      </header>

      {/* Centered Proportional Login Card */}
      <main className="cyber-login-card">
        {/* Neon Person Avatar Circle */}
        <div className="login-avatar-container">
          <div className="login-avatar-ring">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="cyber-login-title">התחברות מורה</h2>

        {/* Accent Divider */}
        <div className="cyber-accent-divider">
          <span className="divider-dot"></span>
        </div>

        {/* Subtitle */}
        <p className="cyber-login-subtitle">
          התחברו כדי לנהל כיתות, לעקוב אחר התקדמות
          <br />
          וליצור חוויית למידה מנצחת.
        </p>

        {/* Error Notification */}
        {error && <div className="cyber-error-msg">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          
          {/* Username Input */}
          <div className="cyber-input-wrapper">
            <Input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="שם משתמש" 
              className="cyber-input text-right"
              required 
            />
            <span className="input-cyber-icon right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </div>

          {/* Password Input */}
          <div className="cyber-input-wrapper">
            <Input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="סיסמה" 
              className="cyber-input text-right"
              required 
            />
            <span className="input-cyber-icon right">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="input-cyber-icon left eye-toggle-btn"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" className="cyber-btn-login cyan-glow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="login-arrow-icon">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>התחברות</span>
          </button>
        </form>

        {/* Secure connection indicator */}
        <div className="secure-connection-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="secure-icon">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 11 11 13 15 9" />
          </svg>
          <span>החיבור שלך מאובטח</span>
        </div>
      </main>

      {/* Cyberpunk Footer */}
      <footer className="cyber-landing-footer">
        <div className="footer-item">
          <span>הצליחו</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-icon">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <span className="footer-dot">•</span>
        <div className="footer-item">
          <span>התחרו</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-icon">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </div>
        <span className="footer-dot">•</span>
        <div className="footer-item">
          <span>למדו</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-icon">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </div>
      </footer>
    </div>
  );
};

export default TeacherLoginPage;
