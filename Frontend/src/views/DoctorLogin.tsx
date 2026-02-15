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
        
        // ✅ වැදගත්: Dashboard එකට ගැළපෙන ලෙස 'doctorData' නමින් සේව් කරන්න
        const token = response.data;
        localStorage.setItem('doctorData', token); 
        
        navigate('/doctor-dashboard'); 
      }
    } catch (err) {
      console.error(err);
      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="login-container" style={{display: 'flex', height: '100vh'}}>
      <div className="form-panel blue-panel" style={{flex: 1, backgroundColor: '#2E7D32', color: 'white', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <h1>HealthCare +</h1>
        <h2>Doctor Portal</h2>
        <p><i>Access your digital clinic and manage patients with ease...</i></p>
        <img src={signInIllustration} alt="Doctor Login" className="panel-image" style={{maxWidth: '80%', marginTop: '20px', borderRadius: '10px'}} />
      </div>

      <div className="form-panel white-panel" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px'}}>
        <div className="form-content" style={{width: '100%', maxWidth: '400px'}}>
          <h1 className="form-title" style={{marginBottom: '30px', textAlign: 'center'}}>Doctor Log In</h1>
          
          <form onSubmit={handleLogin}>
            <div className="input-group" style={{marginBottom: '20px'}}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc'}}
              />
            </div>
            
            <div className="input-group" style={{marginBottom: '20px'}}>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc'}}
              />
            </div>

            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            <button type="submit" className="form-button" style={{width: '100%', padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
              SIGN IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
