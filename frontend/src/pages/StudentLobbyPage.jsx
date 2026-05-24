import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';
import { createSSEConnection } from '../services/sse';

const StudentLobbyPage = () => {
  const { raceCode } = useParams();
  const [lobbyState, setLobbyState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) {
      navigate(ROUTES.STUDENT_JOIN);
      return;
    }

    let isMounted = true;

    const checkState = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-student-race-state`, { params: { token, raceId } });
        if (isMounted) {
          setLobbyState(res.data);
          if (res.data.raceStatus === 'LIVE' || res.data.raceStatus === 'ACTIVE') {
            navigate(ROUTES.STUDENT_RACE(raceId));
          } else if (res.data.raceStatus === 'FINISHED') {
            navigate(ROUTES.STUDENT_RESULTS(raceId));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const evtSource = createSSEConnection('/subscribe-student-race', { token, raceId }, {
      onOpen: () => {
        if (isMounted) checkState();
      },
      events: {
        'state-update': () => {
          if (isMounted) checkState();
        }
      }
    });

    return () => {
      isMounted = false;
      evtSource.close();
    };
  }, [navigate]);

  return (
    <Layout>
      <div>
        <p>Waiting for teacher to start the race...</p>
        <p>Room Code: {raceCode}</p>
        <p>{lobbyState ? (lobbyState.participantsCount || lobbyState.participantsPositions?.length || 0) : 0} joined</p>
      </div>
    </Layout>
  );
};

export default StudentLobbyPage;
