import React, { useState } from 'react';
import TimerDisplay from './TimerDisplay';

const QuestionCard = ({ question, onSubmitAnswer, onExpire }) => {
  const [answer, setAnswer] = useState('');

  if (!question) return <div className="glow-text-blue">Loading question...</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() !== '') {
      onSubmitAnswer(answer);
      setAnswer('');
    }
  };

  const hasOptions = question.options && Array.isArray(question.options) && question.options.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TimerDisplay expiresAt={question.expiresAt} onExpire={() => onExpire(-1)} />
      
      <div style={{ textAlign: 'center', fontSize: '2rem', margin: '1rem 0', textShadow: '0 0 10px #fff' }}>
        {question.questionText}
      </div>
      
      {question.hintText && <div className="glow-text-green" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>Hint: {question.hintText}</div>}
      
      {hasOptions ? (
        <div className="options-grid">
          {question.options.map((opt, i) => (
            <button key={i} className="option-btn" onClick={() => onSubmitAnswer(opt.id)}>
              {opt.text || opt.label || opt}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: 'auto' }}>
          <input 
            type="text" 
            className="input glow-box-blue" 
            style={{ fontSize: '1.5rem', background: 'transparent', color: 'var(--neon-blue)', textAlign: 'center' }}
            value={answer} 
            onChange={e => setAnswer(e.target.value)} 
            placeholder="ENTER ANSWER" 
            autoFocus 
          />
          <button type="submit" className="option-btn" style={{ width: '100%' }}>SUBMIT</button>
        </form>
      )}
    </div>
  );
};

export default QuestionCard;
