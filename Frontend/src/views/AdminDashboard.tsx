import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, SignInIcon, DoctorIcon, PlusIcon, ListIcon, UsersIcon, CalendarIcon } from '../components/Icons.tsx';
import api from '../api/axios.Config.ts';
import logo from '../assets/logo.png';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// Types 
interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  experience: string;
  password?: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- LOADING STATE ---
  const [isLoading, setIsLoading] = useState(true);

  // states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'patients' | 'appointments'>('dashboard');
  const [doctorSubTab, setDoctorSubTab] = useState<'view' | 'add'>('view');
  
  // Admin Name State
  const [adminName, setAdminName] = useState('');

  // Data State 
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);

  // Doctor Form State 
  const [newDoctor, setNewDoctor] = useState<Doctor>({
    name: '', specialization: '', email: '', phone: '', experience: '', password: ''
  });

    const statsChartData = [
    { name: 'Doctors', count: doctorsList.length, color: '#063ca8' },
    { name: 'Patients', count: patientsList.length, color: '#2E7D32' },
    { name: 'Appointments', count: appointmentsList.length, color: '#FF8F00' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminData'); 
    navigate('/admin-login');
  };

  // ✅ HELPER: Token 
  const getAuthConfig = () => {
      const storedData = localStorage.getItem('adminData');
      let token = null;
      if (storedData) {
          try {
              const parsed = JSON.parse(storedData);
              token = parsed.token || parsed; 
          } catch (e) {
              token = storedData;
          }
      }
      return {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      };
  };

  // Load Admin Name 
  useEffect(() => {
    const storedData = localStorage.getItem('adminData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.name) {
          const firstName = parsedData.name.split(' ')[0];
          setAdminName(firstName);
        } else if (parsedData.email) {
           const nameFromEmail = parsedData.email.split('@')[0];
           setAdminName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
        }
      } catch (e) {
        console.error("Error parsing admin data", e);
      }
    }
  }, []);

  
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
        const config = getAuthConfig();
        
        const [docRes, patRes, appRes] = await Promise.all([
            api.get('/doctors', config),
            api.get('/patients', config),
            api.get('/appointments', config)
        ]);
        
        setDoctorsList(docRes.data);
        setPatientsList(patRes.data);
        setAppointmentsList(appRes.data);
    } catch (err) {
        console.error("Error fetching admin data:", err);
    } finally {
        
        setTimeout(() => setIsLoading(false), 800);
    }
  };

  // Add doctor function
  const handleAddDoctor = async () => {
    try {
      if(!newDoctor.name || !newDoctor.email || !newDoctor.password || !newDoctor.phone || !newDoctor.experience || !newDoctor.specialization) {
        alert("Please fill in ALL required fields!");
        return;
      }

      await api.post('/doctors', newDoctor, getAuthConfig());
      alert("Doctor Added Successfully!");
      
      setNewDoctor({ name: '', specialization: '', email: '', phone: '', experience: '', password: '' });
      
      const res = await api.get('/doctors', getAuthConfig());
      setDoctorsList(res.data);
      setDoctorSubTab('view');
      
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert("Failed to add doctor!");
    }
  };

  // Fetch data (on load)
  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Admin Dashboard';
      case 'doctors': return 'Manage Doctors';
      case 'patients': return 'Patient Directory';
      case 'appointments': return 'All Appointments';
      default: return '';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* --- SIDEBAR --- */}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <img src={logo} alt="Logo" className="dashboard-logo-img" style={{height:'2rem', width:'auto', marginRight:'0.9rem'}} />
          <h2>HealthCare+</h2>
        </div>
        
        <nav className="dashboard-nav">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <UserIcon />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('doctors')} 
            className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
          >
            <DoctorIcon />
            <span>Manage Doctors</span>
          </button>

          <button 
            onClick={() => setActiveTab('patients')} 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
          >
            <UsersIcon />
            <span>View Patients</span>
          </button>

          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
          >
            <CalendarIcon />
            <span>Appointments</span>
          </button>
        </nav>

        <div className="dashboard-logout">
          <button onClick={handleLogout} className="nav-item">
            <SignInIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="dashboard-main">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{margin: 0}}>{getTitle()}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{textAlign: 'right', lineHeight: '1.2'}}>
                  <span style={{display: 'block', fontSize: '0.8rem', color: '#888'}}>Welcome,</span>
                  <span style={{fontWeight: 'bold', color: '#063ca8', fontSize: '1.1rem'}}>
                      {adminName || 'Admin'}
                  </span>
              </div>
              <div style={{
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: '#f4f7fa', 
                  color: '#063ca8',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0'
              }}>
                  <UserIcon />
              </div>
          </div>
        </header>

        <div className="dashboard-content-wrapper">
          
         
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="main-slider-viewport"
            >
              <div className={`main-slider-track pos-${activeTab}`}>
  
  {/* --- 1. DASHBOARD SLIDE --- */}
  <div className="main-slider-slide">
                  {/* --- Stat Cards Section --- */}
                  <section className="dashboard-content">
                    <div className="stat-card">
                      <h3>Total Patients</h3>
                      <p>{patientsList.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Doctors</h3>
                      <p>{doctorsList.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Appointments</h3>
                      <p>{appointmentsList.length}</p>
                    </div>
                  </section>

                  {/* --- Visual Charts Section --- */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>
                    
                    {/* Bar Chart */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: '#555' }}>System Overview (Real-time)</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statsChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{fill: '#f4f7fa'}} />
                            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                              {statsChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Donut Chart */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: '#555' }}>Data Distribution</h3>
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statsChartData}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                            >
                              {statsChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div> {/* Visual Charts Section End */}
                </div> 

                <div className="main-slider-slide">
                  <section className="doctors-section">
                    <div className="action-buttons-container">
                      <button 
                        className={`action-btn ${doctorSubTab === 'view' ? 'active' : ''}`}
                        onClick={() => setDoctorSubTab('view')}
                      >
                        <ListIcon />
                        View Doctors
                      </button>
                      <button 
                        className={`action-btn ${doctorSubTab === 'add' ? 'active' : ''}`}
                        onClick={() => setDoctorSubTab('add')}
                      >
                        <PlusIcon />
                        Add Doctor
                      </button>
                    </div>

                    <div className="slider-viewport">
                      <div className={`slider-track ${doctorSubTab === 'add' ? 'slide-left' : ''}`}>
                        
                        <div className="slider-slide">
                          <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Specialization</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Exp</th>
                                </tr>
                              </thead>
                              <tbody>
                                {doctorsList.map((d) => (
                                  <tr key={d.id}>
                                    <td>{d.name}</td>
                                    <td>{d.specialization}</td>
                                    <td>{d.email}</td>
                                    <td>{d.phone}</td>
                                    <td>{d.experience}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="slider-slide">
                          <div className="form-container">
                            <h3>Register New Doctor</h3>
                            <form className="admin-form">
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Doctor Name</label>
                                  <input type="text" value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>Specialization</label>
                                  <input type="text" value={newDoctor.specialization} onChange={e => setNewDoctor({...newDoctor, specialization: e.target.value})} />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Email</label>
                                  <input type="email" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>Phone</label>
                                  <input type="text" value={newDoctor.phone} onChange={e => setNewDoctor({...newDoctor, phone: e.target.value})} />
                                </div>
                              </div>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Experience</label>
                                  <input type="text" value={newDoctor.experience} onChange={e => setNewDoctor({...newDoctor, experience: e.target.value})} />
                                </div>
                                <div className="form-group">
                                  <label>Password</label>
                                  <input type="password" value={newDoctor.password} onChange={e => setNewDoctor({...newDoctor, password: e.target.value})} />
                                </div>
                              </div>
                              
                              <button type="button" className="save-btn" onClick={handleAddDoctor}>Save Doctor</button>
                            </form>
                          </div>
                        </div>

                      </div>
                    </div>
                  </section>
                </div>

                <div className="main-slider-slide">
                  <section className="doctors-section">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientsList.map((p) => (
                            <tr key={p.id}>
                              <td>{p.firstName} {p.lastName}</td>
                              <td>{p.email}</td>
                              <td>{p.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="main-slider-slide">
                  <section className="doctors-section"> 
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointmentsList.map((a) => (
                            <tr key={a.id}>
                              <td>{a.id}</td>
                              <td>{a.date}</td>
                              <td>{a.time}</td>
                              <td>{a.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;