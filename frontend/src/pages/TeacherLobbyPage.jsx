import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ParticipantList from '../components/ParticipantList';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';

const TeacherLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobby, setLobby] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) {
      navigate(ROUTES.TEACHER_LOGIN);
      return;
    }

    let isMounted = true;

    const fetchLobby = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-race-lobby`, { params: { token, raceId } });
        if (isMounted) setLobby(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    const evtSource = createSSEConnection('/subscribe-race-dashboard', { token, raceId }, {
      onOpen: () => {
        if (isMounted) fetchLobby();
      },
      events: {
        'participant-progress-updated': () => {
          if (isMounted) fetchLobby();
        },
        'race-started': () => {
          if (isMounted) fetchLobby();
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [navigate]);

  const handleStart = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
      formData.append('raceId', Cookies.get(COOKIE_RACE_ID));
      const res = await axios.post(`${API_BASE}/start-race`, formData);
      if (res.data.success) {
        navigate(ROUTES.TEACHER_DASHBOARD(Cookies.get(COOKIE_RACE_ID)));
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!lobby) return <Layout>Loading lobby...</Layout>;

  return (
    <Layout>
      <div>
        <h1>Room Code: {raceCode}</h1>
        <p>Waiting for students... ({lobby.participantsCount || (lobby.participants ? lobby.participants.length : 0)} joined)</p>
      </div>
      
      <ParticipantList participants={lobby.participants} />
      
      <div style={{ marginTop: '2rem' }}>
        <Button disabled={!lobby.canStart} onClick={handleStart}>Start Race</Button>
      </div>
    </Layout>
  );
};

export default TeacherLobbyPage;
