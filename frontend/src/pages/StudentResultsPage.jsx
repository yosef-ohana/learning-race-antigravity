import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Leaderboard from '../components/Leaderboard';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_STUDENT_TOKEN, COOKIE_RACE_ID } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const StudentResultsPage = () => {
  const { raceId } = useParams();
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(COOKIE_STUDENT_TOKEN);
    if (!token) return navigate(ROUTES.STUDENT_JOIN);

    axios.get(`${API_BASE}/get-race-results`, { params: { token, raceId } })
      .then(res => setResults(res.data))
      .catch(err => console.error(err));
  }, [raceId, navigate]);

  if (!results) return <Layout>Loading results...</Layout>;

  return (
    <Layout>
      <div>
        <h1>Race Finished!</h1>
        {results.winner && (
          <h2>Winner: {results.winner.displayName} 🏆</h2>
        )}
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Final Podium</h3>
          <Leaderboard leaderboard={results.leaderboard} />
        </div>
        
        <div style={{ marginTop: '3rem' }}>
          <Button onClick={() => {
            Cookies.remove(COOKIE_STUDENT_TOKEN);
            Cookies.remove(COOKIE_RACE_ID);
            navigate(ROUTES.STUDENT_JOIN);
          }}>Join Another Race</Button>
        </div>
      </div>
    </Layout>
  );
};

export default StudentResultsPage;
