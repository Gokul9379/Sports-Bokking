// src/services/api.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL,
  withCredentials: true, // keep true if your backend uses cookies for auth
});

// attach token automatically (keeps your existing interceptor behaviour)
API.interceptors.request.use((req) => {
  try {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    // ignore read errors
  }
  return req;
});

export default API;
