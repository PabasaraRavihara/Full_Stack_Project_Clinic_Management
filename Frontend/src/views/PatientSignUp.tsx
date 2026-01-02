import { useState } from 'react';
//  Types  import 
import type { Dispatch, SetStateAction } from 'react'; 
import type { ViewMode } from '../types/types';
import { MailIcon, LockIcon } from '../components/Icons.tsx'; 
import signUpIllustration from '../assets/signup.jpg';
import api from '../api/axios.Config';

interface PatientSignUpProps {
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
}

const PatientSignUp = ({ setViewMode }: PatientSignUpProps) => {
  
  //  States
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      age: '',
      gender: 'Male', 
      phone: '',
      address: ''
  });

  const [error, setError] = useState('');

  // Input  State update 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    //  Validation
    if(!formData.firstName || !formData.email || !formData.password || !formData.phone) {
        setError("Please fill in all required fields.");
        return;
    }

    try {
      // Backend  Request 
      const response = await api.post('/patients', formData);

      if (response.status === 201 || response.status === 200) {
          alert("Registration Successful! Please Sign In.");
          setViewMode('patientSignIn'); 
      }

    } catch (err: any) {
      console.error("Signup Error:", err);
      setError("Registration Failed. Email or Phone might be already used.");
    }
  };

  return (
    <>
      {/* --- BLUE LEFT PANEL --- */}
      <div className="form-panel blue-panel">
        <h1>HealthCare +</h1>
        <h2>Join Us Today</h2>
        <p><i>Register to access your medical records and appointments...</i></p>
        <img src={signUpIllustration} alt="Sign up" className="panel-image" />
      </div>

      {/* WHITE RIGHT PANEL */}
      <div className="form-panel white-panel">
        <div className="white-panel-header">
          <p>
            Already have an account? 
            <span onClick={() => setViewMode('patientSignIn')} className="toggle-link">Sign In</span>
          </p>
        </div>

        <div className="form-content" style={{justifyContent: 'flex-start', paddingTop: '20px', overflowY: 'auto', maxHeight: '550px'}}>
          <h2 className="form-title">Create Account</h2>
          
          <form onSubmit={handleSignup} style={{width: '100%'}}>
            
            {/* Name row */}
            <div style={{display: 'flex', gap: '10px'}}>
                <div className="input-group">
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>
            </div>

            {/* Email & Phone rows */}
            <div className="input-group">
              <span className="icon"><MailIcon /></span>
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <span className="icon">📞</span>
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
            </div>

            {/* Age & Gender rows */}
            <div style={{display: 'flex', gap: '10px'}}>
                <div className="input-group">
                    <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        style={{width: '100%', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: 'white'}}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
            </div>

            {/* Address rows */}
            <div className="input-group">
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            </div>
            
            {/* Password row */}
            <div className="input-group">
              <span className="icon"><LockIcon /></span>
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>
            
            {error && <p style={{color: 'red', marginBottom: '10px', fontSize:'0.9rem'}}>{error}</p>}

            <button type="submit" className="form-button">SIGN UP</button>
          </form>
          
          <p className="footer-text" style={{marginTop: '1rem'}}>
            By clicking Sign Up, you agree to our terms.
          </p>
        </div>
      </div>
    </>
  );
};

export default PatientSignUp;