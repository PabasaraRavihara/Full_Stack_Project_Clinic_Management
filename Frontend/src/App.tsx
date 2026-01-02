import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// Import Types
import type { ViewMode } from './types/types.ts';

// Import Sidebar Icons
import { SignInIcon, SignUpIcon, DoctorIcon, StethoscopeIcon, HomeIcon } from './components/Icons.tsx';

// Import View Components
import PatientSignIn from './views/PatientSignIn.tsx';
import PatientSignUp from './views/PatientSignUp.tsx';
import PatientDashboard from './views/PatientDashboard.tsx';
import DoctorLogin from './views/DoctorLogin.tsx';
import DoctorDashboard from './views/DoctorDashboard.tsx';
import AdminLogin from './views/AdminLogIn.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import Home from './views/Home.tsx'; 

// Auth Layout Wrapper 
const AuthLayout = ({ children, activeTab }: { children: React.ReactNode, activeTab: string }) => {
  const navigate = useNavigate();
  // State for animation
  const [isExiting, setIsExiting] = useState(false);

  // Handler for Go Home
  const handleGoHome = () => {
    setIsExiting(true); // Start animation
    setTimeout(() => {
      navigate('/home'); // Navigate 
    }, 500); 
  };

  return (
    <div className="auth-background">
      <div 
        className="app-wrapper"
        // Apply animation styles 
        style={{
          transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
          transform: isExiting ? 'translateX(-100vw)' : 'none',
          opacity: isExiting ? 0.5 : 1
        }}
      >
        {/* --- SIDEBAR --- */}
        <div className="sidebar">
          
          {/* ---Home Button --- */}
          <div
            className="sidebar-icon"
            onClick={handleGoHome} 
            title="Go to Home Page"
          >
            <HomeIcon />
            <span>Home</span>
          </div>

          {/* Patient Sign In */}
          <div
            className={`sidebar-icon ${activeTab === 'patientSignIn' ? 'active' : ''}`}
            onClick={() => navigate('/patient-login')}
          >
            <SignInIcon /> 
            <span>Sign In</span>
          </div>

          {/* Patient Sign Up */}
          <div
            className={`sidebar-icon ${activeTab === 'patientSignUp' ? 'active' : ''}`}
            onClick={() => navigate('/patient-signup')}
          >
            <SignUpIcon /> 
            <span>Sign Up</span>
          </div>

          {/* Doctor Log In */}
          <div
            className={`sidebar-icon ${activeTab === 'doctorLogin' ? 'active' : ''}`}
            onClick={() => navigate('/doctor-login')}
          >
            <StethoscopeIcon /> 
            <span>Doctor</span>
          </div>

          {/* Admin Log In */}
          <div
            className={`sidebar-icon ${activeTab === 'adminLogin' ? 'active' : ''}`}
            onClick={() => navigate('/admin-login')}
            style={{ marginTop: 'auto', marginBottom: '20px' }} 
          >
            <DoctorIcon /> 
            <span>Admin</span>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className={`main-container ${activeTab !== 'patientSignUp' ? 'sign-in-mode' : ''}`}>
           {children}
        </div>
      </div>
    </div>
  );
};

// Main App Component 
function App() {
  
  // Navigation
  const AuthRoute = ({ component: Component, mode }: { component: any, mode: ViewMode }) => {
      const navigate = useNavigate();
      
      const handleSetViewMode = (newMode: ViewMode) => {
          if (newMode === 'patientSignIn') navigate('/patient-login');
          if (newMode === 'patientSignUp') navigate('/patient-signup');
          if (newMode === 'doctorLogin') navigate('/doctor-login');
          if (newMode === 'adminLogin') navigate('/admin-login');
      };

      return (
          <AuthLayout activeTab={mode}>
              <Component setViewMode={handleSetViewMode} />
          </AuthLayout>
      );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* --- HOME ROUTE --- */}
        <Route path="/home" element={<Home />} />
        
        {/* --- AUTH ROUTES  --- */}
        <Route path="/patient-login" element={<AuthRoute component={PatientSignIn} mode="patientSignIn" />} />
        <Route path="/patient-signup" element={<AuthRoute component={PatientSignUp} mode="patientSignUp" />} />
        <Route path="/doctor-login" element={<AuthRoute component={DoctorLogin} mode="doctorLogin" />} />
        <Route path="/admin-login" element={<AuthRoute component={AdminLogin} mode="adminLogin" />} />

        {/* --- DASHBOARD ROUTES --- */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* --- DEFAULT --- */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;