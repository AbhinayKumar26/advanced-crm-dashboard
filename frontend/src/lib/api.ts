import axios from 'axios';

export const api = axios.create({
  // This points to the Express server URL we set in .env.local
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});