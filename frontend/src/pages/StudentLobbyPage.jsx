import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentLobbyPage = () => {
  const { raceCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    const raceId = Cookies.get(COOKIE_RACE_ID);
    if (!token || !raceId) {
      navigate(ROUTES.STUDENT_JOIN);
      return;
    }

    const checkState = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-student-race-state`, { params: { token, raceId } });
        if (res.data.raceStatus === 'LIVE') {
          navigate(ROUTES.STUDENT_RACE(raceId));
        } else if (res.data.raceStatus === 'FINISHED') {
          navigate(ROUTES.STUDENT_RESULTS(raceId));
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkState();
    const interval = setInterval(checkState, 2000); // Polling instead of SSE
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <Layout>
      <Card style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2>You're in!</h2>
        <p>Room Code: <strong>{raceCode}</strong></p>
        <p>Waiting for the teacher to start the race...</p>
      </Card>
    </Layout>
  );
};

export default StudentLobbyPage;
