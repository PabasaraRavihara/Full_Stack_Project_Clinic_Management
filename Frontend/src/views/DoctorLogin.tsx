import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api/axios.Config'; 
import { LockIcon, UserIcon } from '../components/Icons'; 
import signInIllustration from '../assets/doctor.jpg'; 

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/doctors/login', {
        email: email,
        password: password
      });

      if (response.status === 200) {
        console.log("Doctor Login Success!");
        localStorage.setItem('doctorData', JSON.stringify(response.data));
        navigate('/doctor-dashboard'); 
      }
    } catch (err) {
      console.error(err);
      setError("Invalid Email or Password");
    }
  };

  return (
    <>
      {/* Blue Panel */}
      <div className="form-panel blue-panel">
        <h1>HealthCare +</h1>
        <h2>Doctor Portal</h2>
        <p><i>Access your digital clinic and manage patients with ease...</i></p>
        <img src={signInIllustration} alt="Doctor Login" className="panel-image" />
      </div>

      {/* Form*/}
      <div className="form-panel white-panel">
        <div className="form-content">
          <h1 className="form-title">Doctor Log In</h1>
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <span className="icon"><UserIcon /></span>
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

            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <button type="submit" className="form-button">
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DoctorLogin;