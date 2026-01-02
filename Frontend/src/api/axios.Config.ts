import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8083/api', // Make sure this matches your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR: Attach Token to Requests ---
api.interceptors.request.use(
  (config) => {
    // Check for any stored user data
    const adminData = localStorage.getItem('adminData');
    const doctorData = localStorage.getItem('doctorData');
    const patientData = localStorage.getItem('patientData');

    let token = null;

    // Logic to find the active token
    if (adminData) {
      const parsed = JSON.parse(adminData);
      token = parsed.token || parsed.id; // Adjust based on what your backend sends
    } else if (doctorData) {
      const parsed = JSON.parse(doctorData);
      token = parsed.token || parsed.id;
    } else if (patientData) {
      const parsed = JSON.parse(patientData);
      token = parsed.token || parsed.id;
    }

    if (token) {
      // Attach token to Authorization header (Bearer standard)
      // config.headers.Authorization = `Bearer ${token}`;
      
      // OR if your backend just expects the ID or a custom header:
      // config.headers['x-auth-token'] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;