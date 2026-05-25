import React from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h1>ברוכים הבאים ל-Math Race</h1>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Button onClick={() => navigate(ROUTES.TEACHER_LOGIN)} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
            אני מורה
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.STUDENT_JOIN)} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
            אני תלמיד
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
