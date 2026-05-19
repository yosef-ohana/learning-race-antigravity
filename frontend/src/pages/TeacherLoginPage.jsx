import React, { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const TeacherLoginPage = () => {
  const [username, setUsername] = useState('teacher');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('usernameOrEmail', username);
      formData.append('password', password);

      const res = await axios.post(`${API_BASE}/teacher-login`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_TEACHER_TOKEN, res.data.token);
        navigate(ROUTES.TEACHER_CREATE_RACE);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Login failed.');
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <Card className="auth-box">
          <h2 style={{marginTop: 0}}>Teacher Login</h2>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleLogin}>
            <Input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <Button type="submit" style={{width: '100%'}}>Login</Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherLoginPage;
