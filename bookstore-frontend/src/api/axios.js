import axios from 'axios';

/*
 * axios instance — base config for all API calls
 * baseURL → Spring Boot backend URL
 * All requests automatically go to localhost:8080
 */
const API = axios.create({
  baseURL: 'http://localhost:8080',
});

/*
 * Request interceptor — runs before every API call
 * Reads JWT token from localStorage
 * Adds it as Authorization: Bearer <token> header
 * So we never have to manually add token to each request
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;