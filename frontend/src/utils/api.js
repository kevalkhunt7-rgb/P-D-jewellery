import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add countryCode to all requests
    const countryCode = localStorage.getItem('countryCode');
    if (countryCode) {
      if (!config.params) config.params = {};
      config.params.countryCode = countryCode;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
