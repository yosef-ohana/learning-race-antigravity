import React, { useState } from 'react';
import TimerDisplay from './TimerDisplay';

const QuestionCard = ({ question, onSubmitAnswer, onExpire }) => {
  const [answer, setAnswer] = useState('');

  if (!question) return <div className="glow-text-blue">טוען שאלה...</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() !== '') {
      onSubmitAnswer(answer);
      setAnswer('');
    }
  };

  const hasOptions = question.options && Array.isArray(question.options) && question.options.length > 0;

  return (
    <div className="question-container">
      <div className="question-left-pane">
        <TimerDisplay expiresAt={question.expiresAt} onExpire={() => onExpire(-1)} />
        
        <div style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 5vh, 2.8rem)', margin: '1rem 0', textShadow: '0 0 15px #fff', fontWeight: 'bold' }}>
          {question.questionText}
        </div>
        
        {question.hintText && (
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: 'clamp(1rem, 3vh, 1.4rem)', color: 'var(--neon-green)', textShadow: '0 0 10px var(--neon-green)' }}>
            💡 רמז: {question.hintText}
          </div>
        )}
      </div>
      
      <div className="question-right-pane">
        {hasOptions ? (
          <div className="options-grid">
            {question.options.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => onSubmitAnswer(opt.id)}>
                {opt.text || opt.label || opt}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <input 
              type="text" 
              className="input glow-box-blue" 
              style={{ fontSize: 'clamp(1.5rem, 4vh, 2.2rem)', padding: '0.8rem', background: 'rgba(0,0,0,0.5)', border: '2px solid var(--neon-blue)', color: 'var(--neon-blue)', textAlign: 'center', borderRadius: '12px', boxShadow: 'inset 0 0 10px rgba(0,243,255,0.2)' }}
              value={answer} 
              onChange={e => setAnswer(e.target.value)} 
              placeholder="הזינו תשובה" 
              autoFocus 
            />
            <button type="submit" className="option-btn" style={{ width: '100%', marginTop: '1rem' }}>שלח תשובה</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
