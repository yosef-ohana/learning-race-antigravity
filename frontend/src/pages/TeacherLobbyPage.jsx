import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import ParticipantList from '../components/ParticipantList';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

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

    const fetchLobby = async () => {
      try {
        const res = await axios.get(`${API_BASE}/get-race-lobby`, { params: { token, raceId } });
        setLobby(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchLobby();
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
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

  if (!lobby) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Room Code: <span style={{fontSize: '3rem', color: 'var(--primary)'}}>{raceCode}</span></h1>
        <p>Waiting for students... ({lobby.participantsCount} joined)</p>
      </div>
      <Card style={{maxWidth: '600px', margin: '0 auto'}}>
        <ParticipantList participants={lobby.participants} />
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Button disabled={!lobby.canStart} onClick={handleStart} style={{padding: '1rem 2rem'}}>Start Race</Button>
        </div>
      </Card>
    </Layout>
  );
};

export default TeacherLobbyPage;
