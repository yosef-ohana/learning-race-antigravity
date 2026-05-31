import React, { useState, useEffect, useRef } from 'react';
import RaceTrack from '../components/RaceTrack';
import PathChoiceModal from '../components/PathChoiceModal';
import QuestionCard from '../components/QuestionCard';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN } from '../config/cookieNames';
import { fetchStudentRaceState, fetchCurrentQuestion, submitAnswer, choosePath, useHelp } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';

const StudentRacePage = () => {
  const { raceId } = useParams();
  const [state, setState] = useState(null);
  const [question, setQuestion] = useState(null);
  const [event, setEvent] = useState(null);
  const [sseError, setSseError] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [frozenTimeRemaining, setFrozenTimeRemaining] = useState(0);
  const [luckPopup, setLuckPopup] = useState(null);
  const prevMultiplierRef = useRef(1);
  const luckTimeoutRef = useRef(null);
  const eventTimeoutRef = useRef(null);
  const fetchSequenceRef = useRef(0);
  const navigate = useNavigate();

  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  const activeLuckMultiplier = Number(state?.playerState?.activeLuckMultiplier || 1);

  const fetchStateAndQuestion = async () => {
    const currentSeq = ++fetchSequenceRef.current;
    try {
      const stateRes = await fetchStudentRaceState(raceId);
      if (currentSeq !== fetchSequenceRef.current) return;
      
      let newState = stateRes.data;
      setState(newState);

      if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.raceFinished)) {
        navigate(ROUTES.STUDENT_RESULTS(raceId));
        return;
      }

      if (newState.canPlay && !newState.playerState.hasPendingDecision && newState.playerState.status !== 'FROZEN') {
        const qRes = await fetchCurrentQuestion(raceId);
        if (currentSeq !== fetchSequenceRef.current) return;
        
        if (qRes.data) {
          setQuestion(qRes.data);
        } else {
          const recoveryRes = await fetchStudentRaceState(raceId);
          if (currentSeq !== fetchSequenceRef.current) return;
          
          newState = recoveryRes.data;
          setState(newState);
          
          if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.raceFinished)) {
            navigate(ROUTES.STUDENT_RESULTS(raceId));
            return;
          }
          
          setQuestion(null);
        }
      } else {
        setQuestion(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) return navigate(ROUTES.STUDENT_JOIN);
    
    let isMounted = true;
    
    const evtSource = createSSEConnection('/subscribe-student-race', { token, raceId }, {
      onOpen: () => {
        if (isMounted) {
          setSseError(false);
          fetchStateAndQuestion();
        }
      },
      onError: () => {
        if (isMounted) {
          setSseError(true);
        }
      },
      events: {
        'participant-progress-updated': () => {
          if (isMounted) fetchStateAndQuestion();
        },
        'race-finished': () => {
          if (isMounted) navigate(ROUTES.STUDENT_RESULTS(raceId));
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [raceId, navigate, token]);

  useEffect(() => {
    let interval = null;
    if (state?.playerState?.status === 'FROZEN' && state?.playerState?.freezeUntil) {
      const calculateRemaining = () => {
        const remaining = Math.max(0, state.playerState.freezeUntil - Math.floor(Date.now() / 1000));
        setFrozenTimeRemaining(remaining);
        if (remaining === 0) {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          fetchStateAndQuestion();
        }
      };
      calculateRemaining();
      interval = setInterval(calculateRemaining, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  useEffect(() => {
    if (activeLuckMultiplier !== prevMultiplierRef.current) {
      if (luckTimeoutRef.current) {
        clearTimeout(luckTimeoutRef.current);
        luckTimeoutRef.current = null;
      }
      if (activeLuckMultiplier > 1 && prevMultiplierRef.current === 1) {
        setLuckPopup({ type: 'BOOST', text: '⚡ בוסט פעיל! התשובה הנכונה הבאה שווה פי 1.5' });
        luckTimeoutRef.current = setTimeout(() => {
          setLuckPopup(null);
        }, 2000);
      } else if (activeLuckMultiplier < 1 && prevMultiplierRef.current === 1) {
        setLuckPopup({ type: 'PUNCTURE', text: '⚠️ פנצ\'ר! התשובה הנכונה הבאה תעניק חצי מהנקודות' });
        luckTimeoutRef.current = setTimeout(() => {
          setLuckPopup(null);
        }, 2000);
      }
      prevMultiplierRef.current = activeLuckMultiplier;
    }
  }, [activeLuckMultiplier]);

  useEffect(() => {
    return () => {
      if (luckTimeoutRef.current) clearTimeout(luckTimeoutRef.current);
      if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
    };
  }, []);

  const handlePathChoice = async (choice) => {
    try {
      await choosePath(raceId, choice);
      fetchStateAndQuestion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleHelpChoice = async (choice) => {
    try {
      await useHelp(raceId, choice);
      fetchStateAndQuestion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAnswer = async (answer) => {
    if (isAnswering) return; // Prevent double submit
    if (state?.playerState?.status === 'FROZEN') return; // Do not allow answering during FROZEN
    setIsAnswering(true);
    const isTimeout = answer === '' || answer === -1 || answer === '-1';
    try {
      const res = await submitAnswer(raceId, question?.questionId || '', answer);
      if (res.data.success) {
        if (res.data.isCorrect) {
          setEvent('תשובה נכונה!');
        } else if (isTimeout) {
          setEvent('⏰ נגמר הזמן!');
        } else {
          setEvent('תשובה שגויה!');
        }
        setQuestion(null);
        fetchStateAndQuestion();
        
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => {
          setEvent(null);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!state || !state.playerState) return <div className="student-layout hebrew-text" style={{ justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>טוען נתונים...</div>;

  return (
    <div className="student-layout">
      {sseError && (
        <div className="overlay-blur hebrew-text" style={{ zIndex: 9999, color: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: 'inset 0 0 50px rgba(255,0,0,0.2)' }}>
          <h2 style={{ fontSize: '3rem' }}>החיבור נותק</h2>
          <p>מנסה להתחבר מחדש...</p>
        </div>
      )}

      <div className="student-top" style={{ padding: '0.3rem 0.6rem 0.3rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', padding: '0 0.4rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="live-indicator hebrew-text" style={{ fontSize: '0.85rem' }}>שידור חי</div>
            <div className="glow-card hebrew-text" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', border: '1px solid var(--neon-purple)', color: '#fff' }}>
              🏆 מיקום {state.playerState.rank}/{state.participantsPositions.length}
            </div>
          </div>
          
          <div className="glow-card hebrew-text" style={{ padding: '0.3rem 1rem', color: 'var(--neon-blue)', borderColor: 'var(--neon-blue)', fontSize: '1rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{state.playerState.points}</span> נק'
            </div>
            {activeLuckMultiplier > 1 && (
              <div style={{ padding: '0.1rem 0.4rem', background: 'rgba(0, 255, 0, 0.1)', border: '1px solid var(--neon-green)', borderRadius: '4px', color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 0 5px var(--neon-green)', whiteSpace: 'nowrap' }} className="hebrew-text">
                ⚡ בוסט <span className="bidi-isolate">x1.5</span>
              </div>
            )}
            {activeLuckMultiplier < 1 && (
              <div style={{ padding: '0.1rem 0.4rem', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 0 5px var(--danger)', whiteSpace: 'nowrap' }} className="hebrew-text">
                ⚠️ פנצ'ר <span className="bidi-isolate">x0.5</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }} className="hebrew-text">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.8rem', color: 'var(--neon-purple)', fontWeight: 'bold', textShadow: '0 0 5px var(--neon-purple)' }}>
              <span>מד החלטה</span>
              <span className="bidi-isolate">{state.playerState.decisionMeter || 0}%</span>
            </div>
            <div className="decision-meter" style={{ width: '100%', height: '6px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--neon-purple)' }}>
              <div className="decision-fill" style={{ width: `${state.playerState.decisionMeter || 0}%`, height: '100%', background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }}></div>
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
          <RaceTrack participantsPositions={state.participantsPositions} currentUserId={state.playerState.id} />
        </div>
      </div>

      <div className="student-bottom">
        {state.playerState.status === 'FROZEN' && (
          <div className="student-feedback-overlay hebrew-text">
            <div className="student-feedback-card frozen">
              <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>🧊</div>
              <h1 style={{ fontSize: '2.2rem', margin: '0.5rem 0', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>קפוא!</h1>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>מערכת נעולה: <span className="bidi-isolate" style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{frozenTimeRemaining}</span> שניות</h2>
            </div>
          </div>
        )}

        {event && (
          <div className="student-feedback-overlay hebrew-text" style={{ zIndex: 90, pointerEvents: 'none', background: 'transparent', backdropFilter: 'none' }}>
            <div className={`student-feedback-card ${event.includes('נכונה') ? 'success' : 'error'}`} style={{ pointerEvents: 'none' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
                {event.includes('נכונה') ? '🎉' : event.includes('זמן') ? '⏰' : '💥'}
              </div>
              <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{event}</h1>
            </div>
          </div>
        )}

        {luckPopup && (
          <div className="student-feedback-overlay hebrew-text" style={{ zIndex: 100, pointerEvents: 'none', background: 'transparent', backdropFilter: 'none' }}>
            <div className={`student-feedback-card luck ${luckPopup.type === 'BOOST' ? 'boost' : 'puncture'}`} style={{ pointerEvents: 'none' }}>
              <h1 style={{ 
                fontSize: '1.6rem', 
                color: luckPopup.type === 'BOOST' ? 'var(--neon-green)' : 'var(--danger)',
                textShadow: luckPopup.type === 'BOOST' ? '0 0 15px var(--neon-green)' : '0 0 15px var(--danger)',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {luckPopup.text}
              </h1>
            </div>
          </div>
        )}

        {state.playerState.hasPendingDecision ? (
          <PathChoiceModal isOpen={true} onChoice={handlePathChoice} />
        ) : question ? (
          isAnswering ? (
            <div className="overlay-blur hebrew-text">
              <h2 style={{ fontSize: '2rem' }}>מעלה תשובה...</h2>
            </div>
          ) : (
            <QuestionCard 
              question={question} 
              onSubmitAnswer={handleSubmitAnswer} 
              onExpire={() => handleSubmitAnswer('')} 
              hasPendingHelpChoice={state.playerState.hasPendingHelpChoice}
              onHelpChoice={handleHelpChoice}
            />
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }} className="hebrew-text">
            ממתין לשלב הבא...
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRacePage;
