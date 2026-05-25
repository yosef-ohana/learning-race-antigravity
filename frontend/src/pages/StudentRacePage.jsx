import React, { useState, useEffect } from 'react';
import RaceTrack from '../components/RaceTrack';
import PathChoiceModal from '../components/PathChoiceModal';
import QuestionCard from '../components/QuestionCard';
import HelpChoiceModal from '../components/HelpChoiceModal';
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
  const [helpSkippedForCurrent, setHelpSkippedForCurrent] = useState(false);
  const navigate = useNavigate();

  const token = Cookies.get(COOKIE_STUDENT_TOKEN);

  const fetchStateAndQuestion = async () => {
    try {
      const stateRes = await fetchStudentRaceState(raceId);
      const newState = stateRes.data;
      setState(newState);

      if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.raceFinished)) {
        navigate(ROUTES.STUDENT_RESULTS(raceId));
        return;
      }

      if (newState.canPlay && !newState.playerState.hasPendingDecision && !newState.playerState.hasPendingHelpChoice && newState.playerState.status !== 'FROZEN') {
        const qRes = await fetchCurrentQuestion(raceId);
        if (qRes.data) {
          setQuestion(qRes.data);
        } else {
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
      };
      calculateRemaining();
      interval = setInterval(calculateRemaining, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

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

  const handleSkipHelp = () => {
    setHelpSkippedForCurrent(true);
    fetchStateAndQuestion();
  };

  const handleSubmitAnswer = async (answer) => {
    if (isAnswering) return; // Prevent double submit
    setHelpSkippedForCurrent(false);
    setIsAnswering(true);
    try {
      const res = await submitAnswer(raceId, question?.questionId || '', answer);
      if (res.data.success) {
        setEvent(res.data.isCorrect ? 'CORRECT MATCH' : 'SYSTEM ERROR: INCORRECT');
        setQuestion(null);
        fetchStateAndQuestion();
        setTimeout(() => setEvent(null), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!state || !state.playerState) return <div className="student-layout" style={{ justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>INITIALIZING...</div>;

  return (
    <div className="student-layout">
      {sseError && (
        <div className="overlay-blur" style={{ zIndex: 9999, color: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: 'inset 0 0 50px rgba(255,0,0,0.2)' }}>
          <h2 style={{ fontSize: '3rem' }}>NETWORK DISCONNECTED</h2>
          <p>ATTEMPTING RECONNECTION...</p>
        </div>
      )}

      <div className="student-top" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div className="live-indicator" style={{ fontSize: '1rem' }}>LIVE</div>
            <div className="glow-card" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', border: '1px solid var(--neon-purple)', color: '#fff' }}>
              🏆 Rank {state.playerState.rank}/{state.participantsPositions.length}
            </div>
          </div>
          
          <div className="glow-card" style={{ padding: '0.5rem 2rem', color: 'var(--neon-blue)', borderColor: 'var(--neon-blue)', fontSize: '1.2rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{state.playerState.points}</span> pts
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--neon-purple)', fontWeight: 'bold', textShadow: '0 0 5px var(--neon-purple)' }}>
              <span>DECISION METER</span>
              <span>{state.playerState.decisionMeter || 0}%</span>
            </div>
            <div className="decision-meter" style={{ width: '100%', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--neon-purple)' }}>
              <div className="decision-fill" style={{ width: `${state.playerState.decisionMeter || 0}%`, height: '100%', background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--neon-purple)' }}></div>
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <RaceTrack participantsPositions={state.participantsPositions} currentUserId={state.playerState.id} />
        </div>
      </div>

      <div className="student-bottom">
        {state.playerState.status === 'FROZEN' && (
          <div className="overlay-blur">
            <h1 style={{ fontSize: '4rem', margin: 0 }}>🧊 FROZEN 🧊</h1>
            <h2 style={{ fontSize: '2rem', marginTop: '1rem' }}>SYSTEM LOCKED: {frozenTimeRemaining}s</h2>
          </div>
        )}

        {event && (
          <div className="overlay-blur" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 90 }}>
            <h1 style={{ fontSize: '3rem', color: event.includes('CORRECT') ? 'var(--neon-green)' : 'var(--danger)' }}>{event}</h1>
          </div>
        )}

        {state.playerState.hasPendingDecision ? (
          <PathChoiceModal isOpen={true} onChoice={handlePathChoice} />
        ) : (state.playerState.hasPendingHelpChoice && !helpSkippedForCurrent) ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <HelpChoiceModal isOpen={true} onChoice={handleHelpChoice} onSkip={handleSkipHelp} />
          </div>
        ) : question ? (
          isAnswering ? (
            <div className="overlay-blur">
              <h2 style={{ fontSize: '2rem' }}>UPLOADING ANSWER...</h2>
            </div>
          ) : (
            <QuestionCard 
              question={question} 
              onSubmitAnswer={handleSubmitAnswer} 
              onExpire={() => handleSubmitAnswer('')} 
            />
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)' }}>
            AWAITING NEXT PHASE...
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRacePage;
