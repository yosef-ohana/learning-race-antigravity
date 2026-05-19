import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RaceTrack from '../components/RaceTrack';
import Leaderboard from '../components/Leaderboard';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const TeacherRaceDashboardPage = () => {
  const { raceId } = useParams();
  const [snapshot, setSnapshot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_TEACHER_TOKEN);
    if (!token) return navigate(ROUTES.TEACHER_LOGIN);

    // Snapshot first
    axios.get(`${API_BASE}/get-dashboard-snapshot`, { params: { token, raceId } })
      .then(res => {
        setSnapshot(res.data);
        if (res.data.raceStatus === 'FINISHED') {
          navigate(ROUTES.TEACHER_RESULTS(raceId));
        }
      });

    // Then SSE
    const evtSource = new EventSource(`${API_BASE}/subscribe-race-dashboard?token=${token}&raceId=${raceId}`);
    
    evtSource.addEventListener('participant-progress-updated', (e) => {
      axios.get(`${API_BASE}/get-dashboard-snapshot`, { params: { token, raceId } })
        .then(res => setSnapshot(res.data));
    });

    evtSource.addEventListener('race-finished', () => {
      navigate(ROUTES.TEACHER_RESULTS(raceId));
    });

    return () => evtSource.close();
  }, [raceId, navigate]);

  const handleFinish = async () => {
    const formData = new URLSearchParams();
    formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
    formData.append('raceId', raceId);
    await axios.post(`${API_BASE}/finish-race`, formData);
    navigate(ROUTES.TEACHER_RESULTS(raceId));
  };

  if (!snapshot) return <Layout>Loading dashboard...</Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Live Race Dashboard</h2>
        <Button variant="danger" onClick={handleFinish}>Finish Race Early</Button>
      </div>
      <RaceTrack participantsPositions={snapshot.participantsPositions} />
      <div style={{marginTop: '2rem'}}>
        <h3>Current Leaderboard</h3>
        <Leaderboard leaderboard={snapshot.leaderboard} />
      </div>
    </Layout>
  );
};

export default TeacherRaceDashboardPage;
