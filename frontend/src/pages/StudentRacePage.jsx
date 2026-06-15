import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN } from '../config/cookieNames';
import { fetchStudentRaceState, fetchCurrentQuestion, submitAnswer, choosePath, useHelp } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';
import StudentRaceHud from '../components/StudentRaceHud';
import StudentRaceOverlays from '../components/StudentRaceOverlays';
import StudentRaceMainStage from '../components/StudentRaceMainStage';

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
        setLuckPopup({ type: 'PUNCTURE', text: "⚠️ פנצ'ר! התשובה הנכונה הבאה תעניק חצי מהנקודות" });
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
      const currentSeq = ++fetchSequenceRef.current;
      const res = await useHelp(raceId, choice);
      if (currentSeq !== fetchSequenceRef.current) return;

      if (res && res.data) {
        setQuestion(res.data);
        
        if (choice === 'HINT') {
          setEvent('רמז הופעל');
        } else if (choice === 'REPLACE') {
          setEvent('השאלה הוחלפה');
        }
        
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => {
          setEvent(null);
        }, 2000);

        const stateRes = await fetchStudentRaceState(raceId);
        if (currentSeq !== fetchSequenceRef.current) return;
        setState(stateRes.data);
      }
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
      <StudentRaceOverlays
        sseError={sseError}
        isFrozen={state.playerState.status === 'FROZEN'}
        frozenTimeRemaining={frozenTimeRemaining}
        event={event}
        luckPopup={luckPopup}
      />

      <StudentRaceHud
        playerState={state.playerState}
        participantsPositions={state.participantsPositions}
        activeLuckMultiplier={activeLuckMultiplier}
      />

      <div className="student-bottom">
        <StudentRaceMainStage
          hasPendingDecision={state.playerState.hasPendingDecision}
          question={question}
          isAnswering={isAnswering}
          hasPendingHelpChoice={state.playerState.hasPendingHelpChoice}
          onPathChoice={handlePathChoice}
          onSubmitAnswer={handleSubmitAnswer}
          onExpire={() => handleSubmitAnswer('')}
          onHelpChoice={handleHelpChoice}
        />
      </div>
    </div>
  );
};

export default StudentRacePage;
