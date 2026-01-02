import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.Config';
import { LockIcon, UserIcon } from '../components/Icons';
import signInIllustration from '../assets/admin.jpg'; 

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/admins/login', {
        email: email,
        password: password
      });

      if (response.status === 200) {
        console.log("Admin Login Success!");
        localStorage.setItem('adminData', JSON.stringify(response.data));
        navigate('/admin-dashboard'); 
      }
    } catch (err) {
      console.error(err);
      setError("Invalid Email or Password. Please Check Database.");
    }
  };

  return (
    <>
      {/* - Blue Panel --- */}
      <div className="form-panel blue-panel">
        <h1>HealthCare +</h1>
        <h2>Admin Portal</h2>
        <p><i>System administration and management dashboard...</i></p>
        <img src={signInIllustration} alt="Admin Login" className="panel-image" />
      </div>

      {/* ---  form --- */}
      <div className="form-panel white-panel">
        <div className="form-content">
          <h1 className="form-title" style={{color: '#d9534f'}}>Admin Login</h1>
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <span className="icon"><UserIcon /></span>
              <input 
                type="email" 
                placeholder="Admin Email" 
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

            {error && <p style={{color: 'red', textAlign: 'center', fontSize: '0.9rem'}}>{error}</p>}

            <button type="submit" className="form-button" style={{background: '#d9534f'}}>
              LOGIN
            </button>
          </form>
          <p className="footer-text">
            Access is restricted to authorized users.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;