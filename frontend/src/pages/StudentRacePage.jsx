import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import QuestionCard from '../components/QuestionCard';
import EventBanner from '../components/EventBanner';
import RaceTrack from '../components/RaceTrack';
import PathChoiceModal from '../components/PathChoiceModal';
import HelpChoiceModal from '../components/HelpChoiceModal';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentRacePage = () => {
  const { raceId } = useParams();
  const [state, setState] = useState(null);
  const [question, setQuestion] = useState(null);
  const [event, setEvent] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const token = Cookies.get(COOKIE_STUDENT_TOKEN);

  const fetchStateAndQuestion = async () => {
    try {
      const stateRes = await axios.get(`${API_BASE}/get-student-race-state`, { params: { token, raceId } });
      const newState = stateRes.data;
      setState(newState);

      if (newState.raceStatus === 'FINISHED' || (newState.playerState && newState.playerState.position >= 1000)) {
        navigate(ROUTES.STUDENT_RESULTS(raceId));
        return;
      }

      if (newState.canPlay && !newState.playerState.hasPendingDecision) {
        const qRes = await axios.get(`${API_BASE}/get-current-question`, { params: { token, raceId } });
        if (qRes.data) {
          setQuestion(qRes.data);
          // Show help modal if behind and we haven't shown it yet for this question context
          if (newState.playerState.hasPendingHelpChoice && !qRes.data.helpUsed && !showHelp) {
            setShowHelp(true);
          }
        } else {
          // No question available (maybe frozen or max decision meter)
          setQuestion(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!token) return navigate(ROUTES.STUDENT_JOIN);
    
    fetchStateAndQuestion();
    const interval = setInterval(fetchStateAndQuestion, 2000);
    return () => clearInterval(interval);
  }, [raceId, navigate, token]);

  const handleSubmitAnswer = async (answer) => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('raceId', raceId);
      formData.append('questionId', question.questionId);
      formData.append('answer', answer);

      const res = await axios.post(`${API_BASE}/submit-answer`, formData);
      if (res.data.success) {
        if (res.data.isCorrect) {
          setEvent(`Correct! +${res.data.progressDelta}m`);
          if (res.data.luckEvent) {
            setTimeout(() => setEvent(`Luck Event: ${res.data.luckEvent}!`), 1500);
          }
        } else {
          setEvent('Incorrect!');
        }
        setQuestion(null);
        setShowHelp(false);
        fetchStateAndQuestion();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpire = async () => {
    // Treat as incorrect/expired
    handleSubmitAnswer('');
  };

  const handlePathChoice = async (choice) => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('raceId', raceId);
      formData.append('choice', choice);
      await axios.post(`${API_BASE}/choose-path`, formData);
      fetchStateAndQuestion();
    } catch (e) {
      console.error(e);
    }
  };

  const handleHelpChoice = async (choice) => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('raceId', raceId);
      formData.append('helpType', choice);
      const res = await axios.post(`${API_BASE}/use-help`, formData);
      setShowHelp(false);
      if (res.data) {
        setQuestion(res.data);
      } else {
        // replaced, fetch new
        fetchStateAndQuestion();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!state || !state.playerState) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', backgroundColor: '#f0f4f8', padding: '1rem', borderRadius: '8px' }}>
        <div><strong>Your Position:</strong> {state.playerState.position}m</div>
        <div><strong>Your Points:</strong> {state.playerState.points}</div>
      </div>
      
      <RaceTrack participantsPositions={state.participantsPositions} currentUserId={state.playerState.id} />
      <div style={{ margin: '1rem 0' }}></div>
      
      <div className="decision-meter">
        <div className="decision-fill" style={{ width: `${state.playerState.decisionMeter}%` }}></div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.8rem' }}>Decision Meter</div>

      <EventBanner event={event} />

      {state.playerState.hasPendingDecision ? (
        <div>Waiting for your decision...</div>
      ) : question ? (
        <QuestionCard question={question} onSubmitAnswer={handleSubmitAnswer} onExpire={handleExpire} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h3>Waiting...</h3>
          <p>You might be frozen from a penalty or luck event.</p>
        </div>
      )}

      <PathChoiceModal 
        isOpen={state.playerState.hasPendingDecision} 
        onChoice={handlePathChoice} 
      />

      <HelpChoiceModal 
        isOpen={showHelp} 
        onChoice={handleHelpChoice} 
        onSkip={() => {
            setShowHelp(false);
            const formData = new URLSearchParams();
            formData.append('token', token);
            formData.append('raceId', raceId);
            axios.post(`${API_BASE}/skip-help`, formData).then(() => fetchStateAndQuestion());
        }} 
      />
    </Layout>
  );
};

export default StudentRacePage;
