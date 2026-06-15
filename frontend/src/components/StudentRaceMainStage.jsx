import React from 'react';
import PathChoiceModal from './PathChoiceModal';
import QuestionCard from './QuestionCard';

/**
 * StudentRaceMainStage — presentational only.
 * Renders the bottom content area of the student race:
 *   - Path-choice modal when hasPendingDecision is true
 *   - Uploading-answer spinner when isAnswering is true
 *   - Question card when a question is available
 *   - Waiting message otherwise
 */
const StudentRaceMainStage = ({
  hasPendingDecision,
  question,
  isAnswering,
  hasPendingHelpChoice,
  onPathChoice,
  onSubmitAnswer,
  onExpire,
  onHelpChoice,
}) => {
  if (hasPendingDecision) {
    return <PathChoiceModal isOpen={true} onChoice={onPathChoice} />;
  }

  if (question) {
    if (isAnswering) {
      return (
        <div className="overlay-blur hebrew-text">
          <h2 style={{ fontSize: '2rem' }}>מעלה תשובה...</h2>
        </div>
      );
    }
    return (
      <QuestionCard
        question={question}
        onSubmitAnswer={onSubmitAnswer}
        onExpire={onExpire}
        hasPendingHelpChoice={hasPendingHelpChoice}
        onHelpChoice={onHelpChoice}
      />
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }} className="hebrew-text">
      ממתין לשלב הבא...
    </div>
  );
};

export default StudentRaceMainStage;
