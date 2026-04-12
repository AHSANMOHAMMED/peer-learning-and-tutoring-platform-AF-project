import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For testing on real devices, replace 'localhost' with your machine's local IP (e.g., 192.168.x.x)
// For Android Emulators, 10.0.2.2 points to the host machine's localhost.
const DEFAULT_IP = '10.0.2.2'; // Change this to your local IP if testing on real device
const API_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  ios: `http://localhost:5001/api`,
  android: `http://${DEFAULT_IP}:5001/api`,
  default: `http://localhost:5001/api`
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login (handled by auth context)
    }
    return Promise.reject(error);
  }
);

export default api;
