import axios from 'axios';

const api = axios.create({
  baseURL: 'https://natural-sapphira-clinic-app-a0ae043a.koyeb.app/api', // Make sure this matches your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR: Attach Token to Requests ---
api.interceptors.request.use(
  (config) => {
    // Check for any stored user data
    // We prioritize the 'token' key if it exists, otherwise fall back to user objects
    let token = localStorage.getItem('token');

    if (!token) {
        const adminData = localStorage.getItem('adminData');
        const doctorData = localStorage.getItem('doctorData');
        const patientData = localStorage.getItem('patientData');

        // Logic to find the active token from objects if not found directly
        if (adminData) {
            try { const parsed = JSON.parse(adminData); token = parsed.token || parsed.id; } catch(e){}
        } else if (doctorData) {
            try { const parsed = JSON.parse(doctorData); token = parsed.token || parsed.id; } catch(e){}
        } else if (patientData) {
            try { const parsed = JSON.parse(patientData); token = parsed.token || parsed.id; } catch(e){}
        }
    }

    if (token) {
      // Attach token to Authorization header (Bearer standard)
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
