import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import Cookies from 'js-cookie';
import { COOKIE_TEACHER_TOKEN, COOKIE_RACE_ID, COOKIE_RACE_CODE } from '../config/cookieNames';
import { API_BASE } from '../config/Constants';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routePaths';

const TeacherCreateRacePage = () => {
  const [title, setTitle] = useState('Math Race');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!Cookies.get(COOKIE_TEACHER_TOKEN)) navigate(ROUTES.TEACHER_LOGIN);
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('token', Cookies.get(COOKIE_TEACHER_TOKEN));
      formData.append('raceTitle', title);

      const res = await axios.post(`${API_BASE}/create-race`, formData);
      if (res.data.success) {
        Cookies.set(COOKIE_RACE_ID, res.data.raceId);
        Cookies.set(COOKIE_RACE_CODE, res.data.raceCode);
        navigate(ROUTES.TEACHER_LOBBY(res.data.raceCode));
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('שגיאה ביצירת המרוץ');
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <Card className="auth-box">
          <h2 style={{marginTop: 0}}>יצירת מרוץ חדש</h2>
          <form onSubmit={handleCreate}>
            <Input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="כותרת המרוץ" />
            <Button type="submit" style={{width: '100%'}}>צור מרוץ</Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherCreateRacePage;
