import React, { useState } from 'react';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import TimerDisplay from './TimerDisplay';

const QuestionCard = ({ question, onSubmitAnswer, onExpire }) => {
  const [answer, setAnswer] = useState('');

  if (!question) return <div>Loading question...</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() !== '') {
      onSubmitAnswer(answer);
      setAnswer('');
    }
  };

  return (
    <Card className="question-card">
      <TimerDisplay expiresAt={question.expiresAt} onExpire={onExpire} />
      <div className="question-text">{question.questionText}</div>
      {question.hintText && <div style={{ color: 'blue', marginBottom: '1rem' }}>{question.hintText}</div>}
      <form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          inputMode="decimal"
          value={answer} 
          onChange={e => setAnswer(e.target.value)} 
          placeholder="Enter answer" 
          autoFocus 
        />
        <Button type="submit">Submit</Button>
      </form>
    </Card>
  );
};

export default QuestionCard;
