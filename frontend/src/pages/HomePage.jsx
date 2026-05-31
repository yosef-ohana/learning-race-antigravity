import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ROUTES } from '../config/routePaths';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove(COOKIE_TEACHER_TOKEN);
    navigate(0); // Forces a reload of the current route to update the auth state and UI
  };

  const isTeacherLoggedIn = !!Cookies.get(COOKIE_TEACHER_TOKEN);

  return (
    <div className="homepage-wrapper">
      {/* Dynamic Cyber Header */}
      <header className="cyber-header">
        <div className="logo-container">
          {/* Custom high-tech SVG shield icon silhouette */}
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 0px 5px var(--neon-purple))' }}>
            <path d="M18 2L32 6C32 20 28 32 18 40C8 32 4 20 4 6L18 2Z" stroke="#bc13fe" strokeWidth="2.5" fill="rgba(188, 19, 254, 0.15)" strokeLinejoin="round"/>
            <path d="M18 11V29" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M11 17C11 23 25 23 25 17" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 14C14 24 22 24 22 14" stroke="#00f3ff" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 20C8 30 28 30 28 20" stroke="#00f3ff" strokeWidth="1.5" strokeLinecap="round"/>
            <polygon points="18,5 20,8 23,8 21,10 22,13 18,11 14,13 15,10 13,8 16,8" fill="#bc13fe" style={{ filter: 'drop-shadow(0px 0px 3px var(--neon-purple))' }}/>
          </svg>
          <span className="logo-text">Innovative Learning Race</span>
        </div>
        {isTeacherLoggedIn && (
          <button onClick={handleLogout} className="cyber-btn-logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        )}
      </header>

      {/* Main Glassmorphic Panel */}
      <main className="cyber-landing-card">
        {/* Cyber Sci-Fi Corner Brackets */}
        <div className="cyber-corner top-left"></div>
        <div className="cyber-corner top-right"></div>
        <div className="cyber-corner bottom-left"></div>
        <div className="cyber-corner bottom-right"></div>

        {/* Glowing Laurels & Trophy */}
        <div className="trophy-container">
          <svg width="68" height="68" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="neon-trophy">
            <path d="M12 42C9 33 11 21 20 15" stroke="#bc13fe" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M52 42C55 33 53 21 44 15" stroke="#bc13fe" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M14 31C11 25 15 17 22 13" stroke="#bc13fe" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M50 31C53 25 49 17 42 13" stroke="#bc13fe" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M22 18H42V30C42 36 37 42 32 42C27 42 22 36 22 30V18Z" stroke="#ffffff" strokeWidth="2.5" fill="rgba(255,255,255,0.06)" strokeLinejoin="round"/>
            <path d="M22 22H15V27C15 31 19 31 22 31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 22H49V27C49 31 45 31 42 31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            <path d="M32 42V49" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M25 49H39" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
            <polygon points="32,23 34,27 38,27 35,29 36,33 32,31 28,33 29,29 26,27 30,27" fill="#bc13fe" style={{ filter: 'drop-shadow(0px 0px 4px var(--neon-purple))' }}/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          ברוכים הבאים ל-<span className="glowing-text">Math Race</span>
        </h1>

        {/* Subtitle */}
        <p className="landing-subtitle">
          בחרו כיצד תרצו להשתתף במרוץ הלמידה החכם
          <br />
          והתחילו את המסע <span className="highlight-magenta">להצלחה!</span>
        </p>

        {/* Cyber Checkered Flag Divider */}
        <div className="cyber-divider">
          <span className="divider-line"></span>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="cyber-divider-flag">
            <rect x="2" y="4" width="20" height="14" rx="1.5" stroke="#bc13fe" strokeWidth="2.5" fill="rgba(10,5,20,0.8)"/>
            <rect x="4" y="6.5" width="4" height="3" fill="#ffffff"/>
            <rect x="8" y="6.5" width="4" height="3" fill="#000000"/>
            <rect x="12" y="6.5" width="4" height="3" fill="#ffffff"/>
            <rect x="16" y="6.5" width="4" height="3" fill="#000000"/>
            <rect x="4" y="9.5" width="4" height="3" fill="#000000"/>
            <rect x="8" y="9.5" width="4" height="3" fill="#ffffff"/>
            <rect x="12" y="9.5" width="4" height="3" fill="#000000"/>
            <rect x="16" y="9.5" width="4" height="3" fill="#ffffff"/>
            <rect x="4" y="12.5" width="4" height="3" fill="#ffffff"/>
            <rect x="8" y="12.5" width="4" height="3" fill="#000000"/>
            <rect x="12" y="12.5" width="4" height="3" fill="#ffffff"/>
            <rect x="16" y="12.5" width="4" height="3" fill="#000000"/>
            <path d="M2 4V21" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="divider-line"></span>
        </div>

        {/* Two Large Profile Selection Action Cards */}
        <div className="action-cards-container">
          <button className="cyber-card-btn teacher" onClick={() => navigate(ROUTES.TEACHER_LOGIN)}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-icon blue-glow">
              <circle cx="7" cy="8" r="3" />
              <path d="M3 19a4 4 0 0 1 8 0" />
              <rect x="13" y="4" width="9" height="7" rx="1" strokeWidth="2" />
              <path d="M15 11v3" />
              <path d="M19 11v5" />
              <path d="M13 18h9" />
            </svg>
            <span>הכנס כמורה</span>
          </button>

          <button className="cyber-card-btn student" onClick={() => navigate(ROUTES.STUDENT_JOIN)}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-icon purple-glow">
              <circle cx="12" cy="7" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              <path d="M12 14v4" />
              <path d="M8 18h8" />
            </svg>
            <span>הכנס כתלמיד</span>
          </button>
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

export default HomePage;

