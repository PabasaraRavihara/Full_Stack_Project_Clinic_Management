import { useState } from 'react';
import type { Dispatch, SetStateAction, FormEvent } from 'react';
import type { ViewMode } from '../types/types.ts';
import { MailIcon, LockIcon } from '../components/Icons.tsx';
import signInIllustration from '../assets/signin.jpg';
import api from '../api/axios.Config.ts'; 
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios'; 

interface PatientSignInProps {
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

const PatientSignIn = ({setViewMode}: PatientSignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    console.log("Attempting login...");

    try {
      const response = await api.post('/patients/login', {
        email: email,
        password: password
      });

      if (response.status === 200) {
        console.log("Patient Login Success!");
        localStorage.setItem('patientData', JSON.stringify(response.data));
        
        // Redirect to Dashboard
        navigate('/patient-dashboard'); 
      }
    } catch (err) {
      console.error("Login Error Details:", err);
      
      if (isAxiosError(err)) {
        if (err.response) {
            const status = err.response.status;
            const msg = err.response.data || err.response.statusText;
            
            if (status === 401 || status === 403) {
                setError("Incorrect Email or Password.");
            } else if (status === 404) {
                setError(`Error 404: The URL '/patients/login' was not found on the server.`);
            } else {
                setError(`Server Error (${status}): ${JSON.stringify(msg)}`);
            }
        } else if (err.request) {
            setError("Network Error: Could not connect to server. Is backend running on port 8083?");
        } else {
            setError("Error: " + err.message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <div className="form-panel blue-panel">
        <h1>HealthCare +</h1>
        <h1>Welcome Back</h1>
        <p><i>Your health is our priority welcome back to better care...</i></p>
        <img src={signInIllustration} alt="Sign In" className="panel-image" />
      </div>

      <div className="form-panel white-panel">
        <div className="white-panel-header">
          <p>
            Don't have an account? <br />
            <span onClick={() => navigate('/patient-signup')} className="toggle-link">Sign Up</span>
          </p>
        </div>

        <div className="form-content">
          <h1 className="form-title">Patient Sign In</h1>
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <span className="icon"><MailIcon /></span>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <span className="icon"><LockIcon /></span>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div style={{ 
                color: '#721c24', 
                backgroundColor: '#f8d7da', 
                borderColor: '#f5c6cb',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="form-button">
              SIGN IN
            </button>
          </form>
          <p className="footer-text">
            By clicking Sign In, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </>
  );
};

export default PatientSignIn;