import React from 'react';
import Modal from './Modal';

const PathChoiceModal = ({ isOpen, onChoice }) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="path-choice-panel hebrew-text">
        <h1 className="path-choice-title">צומת דרכים!</h1>
        <p className="path-choice-subtitle">בחרו את המסלול שלכם לשלב הבא:</p>
        
        <div className="path-choice-grid">
          {/* HIGHWAY Choice */}
          <button 
            className="path-choice-card highway hebrew-text" 
            onClick={() => onChoice('HIGHWAY')}
          >
            <h2 className="path-card-title">אוטוסטרדה</h2>
            <span className="path-card-subtitle">מסלול מהיר ומסוכן</span>
            
            {/* Perspective road SVG */}
            <svg width="80" height="50" viewBox="0 0 100 60" fill="none" stroke="var(--neon-blue)" strokeWidth="2">
              <path d="M 15 50 L 45 10 L 55 10 L 85 50" strokeWidth="3" opacity="0.8" />
              <path d="M 50 10 L 50 50" strokeDasharray="5 5" opacity="0.6" strokeWidth="1.5" />
              <path d="M 28 35 H 72" opacity="0.3" />
              <path d="M 36 23 H 64" opacity="0.3" />
              <path d="M 43 15 H 57" opacity="0.3" />
            </svg>

            <div className="path-card-divider"></div>
            
            <div className="path-card-details">
              <span>⚡ 2 שאלות קשות</span>
              <span>💎 125 נקודות לכל תשובה</span>
            </div>

            <div className="path-card-badge highway-badge">
              🏆 סיכון גבוה, תגמול ענק!
            </div>
          </button>
          
          {/* DIRT ROAD Choice */}
          <button 
            className="path-choice-card dirt-road hebrew-text" 
            onClick={() => onChoice('DIRT_ROAD')}
          >
            <h2 className="path-card-title">דרך עפר</h2>
            <span className="path-card-subtitle">מסלול יציב וזהיר</span>
            
            {/* Winding road SVG */}
            <svg width="80" height="50" viewBox="0 0 100 60" fill="none" stroke="var(--neon-orange)" strokeWidth="2">
              <path d="M 15 50 C 20 40, 75 38, 80 30 C 85 22, 20 18, 50 10" strokeWidth="3" opacity="0.8" />
              <path d="M 5 55 L 12 45" opacity="0.3" />
              <path d="M 95 32 L 88 28" opacity="0.3" />
              <path d="M 10 20 L 22 17" opacity="0.3" />
            </svg>

            <div className="path-card-divider"></div>
            
            <div className="path-card-details">
              <span>🛡️ 3 שאלות קלות</span>
              <span>📈 22 נקודות לכל תשובה</span>
            </div>

            <div className="path-card-badge dirt-badge">
              🛡️ דרך בטוחה לנקודות!
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PathChoiceModal;
