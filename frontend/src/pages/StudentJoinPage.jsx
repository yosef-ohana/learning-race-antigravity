import React, { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentJoinPage = () => {
  const [raceCode, setRaceCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('raceCode', raceCode.toUpperCase());
      formData.append('displayName', displayName);

      const res = await axios.post(`${API_BASE}/join-race`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_STUDENT_TOKEN, res.data.studentToken);
        Cookies.set(COOKIE_RACE_ID, res.data.raceId);
        navigate(ROUTES.STUDENT_LOBBY(res.data.raceCode));
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Join failed.');
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <Card className="auth-box">
          <h2 style={{marginTop: 0}}>Join a Race</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleJoin}>
            <Input type="text" value={raceCode} onChange={e => setRaceCode(e.target.value)} placeholder="Room Code (e.g. ABC123)" required />
            <Input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your Name" required />
            <Button type="submit" style={{width: '100%'}}>Join</Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentJoinPage;
