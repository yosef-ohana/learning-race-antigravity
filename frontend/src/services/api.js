import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE } from '../config/Constants';
import { COOKIE_TEACHER_TOKEN, COOKIE_STUDENT_TOKEN } from '../config/cookieNames';

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const fetchTeacherDashboardSnapshot = async (raceId) => {
  const token = Cookies.get(COOKIE_TEACHER_TOKEN);
  // TODO: confirm endpoint
  return apiClient.get('/get-dashboard-snapshot', { params: { token, raceId } });
};

export const fetchStudentRaceState = async (raceId) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  // TODO: confirm endpoint
  return apiClient.get('/get-student-race-state', { params: { token, raceId } });
};

export const fetchCurrentQuestion = async (raceId) => {
  const token = Cookies.get(COOKIE_STUDENT_TOKEN);
  return apiClient.get('/get-current-question', { params: { token, raceId } });
};

export const joinRace = async (raceCode, studentName) => {
  // TODO: confirm endpoint
  return apiClient.post('/join', { raceCode, studentName });
};

export default apiClient;
