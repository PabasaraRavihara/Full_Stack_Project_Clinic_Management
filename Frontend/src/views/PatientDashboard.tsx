import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.Config'; 
import { UserIcon, SignInIcon, ListIcon, CalendarIcon, HomeIcon } from '../components/Icons.tsx';

// Interfaces
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  address: string;
}

interface Doctor {
  id: number;
  name: string; 
  specialization: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  patient: Patient;
  doctor?: Doctor; 
}

interface MedicalRecord {
  id: number;
  diagnosis: string;
  treatment: string;
  notes: string;
  recordDate: string;
  patient: Patient;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  // States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'records'>('dashboard');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [myRecords, setMyRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // STATES for Booking 
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
      doctorId: '',
      date: '',
      time: '',
      notes: ''
  });

  // Generate 15-min Time Slots 
  const generateTimeSlots = () => {
      const slots:string[] = [];
      const addSlots = (startHour: number, endHour: number) => {
          for (let hour = startHour; hour < endHour; hour++) {
              for (let min = 0; min < 60; min += 15) {
                  const h = hour < 10 ? `0${hour}` : hour;
                  const m = min === 0 ? '00' : min;
                  slots.push(`${h}:${m}`);
              }
          }
      };
      addSlots(7, 10);
      addSlots(17, 22);
      return slots;
  };
  const timeSlots = generateTimeSlots();

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('patientData');
    navigate('/patient-login');
  };

  // Data Fetching 
  useEffect(() => {
    const fetchData = async () => {
      const storedData = localStorage.getItem('patientData');
      if (!storedData) {
        navigate('/patient-login');
        return;
      }
      
      try {
        const parsedPatient = JSON.parse(storedData);
        console.log("Logged In Patient Data:", parsedPatient); // Console එකේ Data ටික බලාගන්න මේක දැම්මා
        setPatient(parsedPatient);

        setLoading(true);
        const appRes = await api.get('/appointments');
        const patientAppointments = appRes.data.filter((a: Appointment) => a.patient?.id === parsedPatient.id);
        setMyAppointments(patientAppointments);

        const recRes = await api.get('/medical-records');
        const patientRecords = recRes.data.filter((r: MedicalRecord) => r.patient?.id === parsedPatient.id);
        setMyRecords(patientRecords);

        const docRes = await api.get('/doctors'); 
        setDoctors(docRes.data);

      } catch (err) {
        console.error("Error fetching patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle Booking
  const handleBookAppointment = async () => {
      if(!patient || !newBooking.doctorId || !newBooking.date || !newBooking.time) {
          alert("Please select a doctor, date and time!");
          return;
      }
      
      try {
          const payload = {
              patientId: patient.id,
              doctorId: parseInt(newBooking.doctorId),
              date: newBooking.date,
              time: newBooking.time + ":00", 
              notes: newBooking.notes
          };

          await api.post('/appointments/book', payload); 
          alert("Appointment Request Sent Successfully!");
          
          setShowBookingForm(false);
          setNewBooking({ doctorId: '', date: '', time: '', notes: '' });
          
          // Refresh appointments list
          const appRes = await api.get('/appointments');
          const patientAppointments = appRes.data.filter((a: Appointment) => a.patient?.id === patient.id);
          setMyAppointments(patientAppointments);

      } catch (error: any) {
          console.error(error);
          if(error.response && error.response.data && error.response.data.message) {
              alert("Booking Failed: " + error.response.data.message);
          } else {
              alert("Booking Failed! This slot might be already taken.");
          }
      }
  };

  if (loading || !patient) return <div style={{padding:'20px'}}>Loading...</div>;

  const sidebarColor = 'white'; 
  const activeTextColor = '#0056b3'; 

  return (
    <div className={`dashboard-layout`}>
      
      {/* --- SIDEBAR --- */}
      <div className="dashboard-sidebar" style={{ background: sidebarColor, color: '#333', borderRight: '1px solid #eee' }}>
        <div className="dashboard-logo" style={{borderBottom:'1px solid #eee', padding:'15px'}}>
          <h2 style={{color: '#0056b3', margin:0, fontSize:'1.4rem'}}>My Health</h2>
        </div>
        
        <nav className="dashboard-nav" style={{marginTop:'10px'}}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            style={activeTab === 'dashboard' ? { color: activeTextColor, background: '#eef2ff' } : { color: '#555' }}
          >
            <UserIcon /> <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            style={activeTab === 'appointments' ? { color: activeTextColor, background: '#eef2ff' } : { color: '#555' }}
          >
            <CalendarIcon /> <span>Appointments</span>
          </button>

          <button 
            onClick={() => setActiveTab('records')} 
            className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
            style={activeTab === 'records' ? { color: activeTextColor, background: '#eef2ff' } : { color: '#555' }}
          >
            <ListIcon /> <span>Medical Records</span>
          </button>

          <button 
            onClick={() => navigate('/')} 
            className="nav-item"
            style={{ color: '#555', marginTop: '10px', borderTop: '1px solid #eee' }}
          >
            <HomeIcon /> <span>Go to Home</span>
          </button>
        </nav>

        <div className="dashboard-logout" style={{borderTop:'1px solid #eee'}}>
          <button onClick={handleLogout} className="nav-item" style={{color: '#d9534f'}}>
            <SignInIcon /> <span>Logout</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="dashboard-main" style={{backgroundColor: '#f8f9fa'}}>
        <header className="dashboard-header" style={{padding:'15px 30px', marginBottom:'20px'}}>
          <h2 style={{fontSize:'1.5rem', margin:0}}>Welcome, {patient.firstName}! 👋</h2>
        </header>

        <div className="dashboard-content-wrapper" style={{padding: '0 30px'}}>
          
          {/* ---- TAB 1: DASHBOARD ---- */}
          {activeTab === 'dashboard' && (
              <div className="dashboard-content">
                <div style={{display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'flex-start'}}>
                    
                    {/* Compact Profile Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderTop: '4px solid #0056b3',
                        flex: '1',
                        minWidth: '300px',
                        maxWidth: '450px'
                    }}>
                      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'15px', paddingBottom:'15px', borderBottom:'1px solid #f0f0f0'}}>
                          <div style={{width:'50px', height:'50px', borderRadius:'50%', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#0056b3'}}>
                              <UserIcon />
                          </div>
                          <div>
                              <h3 style={{margin:0, fontSize:'1.1rem', color:'#333'}}>My Profile</h3>
                              <span style={{fontSize:'0.8rem', color:'#777'}}>Personal Information</span>
                          </div>
                      </div>
                      
                      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'12px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{fontSize:'0.9rem', color:'#666'}}>📧 Email:</span>
                            <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{patient.email || 'N/A'}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{fontSize:'0.9rem', color:'#666'}}>📞 Phone:</span>
                            <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{patient.phone || 'N/A'}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{fontSize:'0.9rem', color:'#666'}}>🎂 Age:</span>
                            <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{patient.age ? `${patient.age} Years` : 'N/A'}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span style={{fontSize:'0.9rem', color:'#666'}}>📍 Address:</span>
                            <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{patient.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        flex: '1',
                        minWidth: '250px',
                        display:'flex',
                        flexDirection:'column',
                        justifyContent:'center',
                        alignItems:'center',
                        height: '240px' // Same height as profile card approx
                    }}>
                      <div style={{width:'60px', height:'60px', borderRadius:'50%', background:'#e6fffa', color:'#00b894', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px'}}>
                          <CalendarIcon />
                      </div>
                      <h3 style={{marginBottom:'5px', fontSize:'1rem', color:'#555'}}>Upcoming Appointments</h3>
                      <p style={{color: '#0056b3', fontSize:'2.5rem', fontWeight:'bold', margin:0}}>
                          {myAppointments.filter(a => a.status === 'APPROVED' || a.status === 'PENDING').length}
                      </p>
                    </div>
                </div>
              </div>
          )}

          {/* ---- TAB 2: APPOINTMENTS ---- */}
          {activeTab === 'appointments' && (
              <section className="doctors-section">
                <div className="d-flex justify-content-between align-items-center mb-4" style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                    <h3 className="m-0" style={{fontSize:'1.2rem'}}>My Appointments</h3>
                    <button 
                      className={`btn`}
                      onClick={() => setShowBookingForm(!showBookingForm)}
                      style={{ 
                          backgroundColor: showBookingForm ? '#dc3545' : '#0056b3', 
                          color:'white', 
                          padding:'8px 15px', 
                          fontSize:'0.9rem',
                          border:'none', 
                          borderRadius:'5px', 
                          cursor:'pointer' 
                      }}
                    >
                      {showBookingForm ? 'Cancel' : '+ Book New'}
                    </button>
                </div>

                {/* BOOKING FORM */}
                {showBookingForm && (
                    <div className="card shadow-sm mb-4" style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)', marginBottom:'20px'}}>
                        <h4 style={{fontSize:'1rem', color:'#0056b3', marginBottom:'15px'}}>📅 Book New Appointment</h4>
                        <div className="row g-3" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                            <div style={{gridColumn:'1 / -1'}}>
                                <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Select Doctor</label>
                                <select 
                                  className="form-select" 
                                  value={newBooking.doctorId} 
                                  onChange={(e) => setNewBooking({...newBooking, doctorId: e.target.value})}
                                  style={{width:'100%', padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                                >
                                    <option value="">-- Choose a Specialist --</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Date</label>
                                <input 
                                  type="date" 
                                  value={newBooking.date} 
                                  onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                                  style={{width:'100%', padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                                />
                            </div>
                            <div>
                                <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Time Slot</label>
                                <select 
                                  value={newBooking.time} 
                                  onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                                  style={{width:'100%', padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                                >
                                    <option value="">-- Choose Time --</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{gridColumn:'1 / -1'}}>
                                <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Reason</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Fever, Checkup..." 
                                  value={newBooking.notes} 
                                  onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                                  style={{width:'100%', padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                                />
                            </div>

                            <div style={{gridColumn:'1 / -1', textAlign:'right'}}>
                                <button 
                                  onClick={handleBookAppointment}
                                  style={{ backgroundColor: '#28a745', color:'white', border: 'none', padding:'8px 20px', borderRadius:'5px', cursor:'pointer', fontSize:'0.9rem' }}
                                >
                                  Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Doctor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myAppointments.length === 0 ? (
                        <tr><td colSpan={4} style={{textAlign:'center', padding:'20px', fontSize:'0.9rem', color:'#777'}}>No Appointments Found</td></tr>
                      ) : (
                        myAppointments.map(appt => (
                          <tr key={appt.id}>
                            <td>{appt.date}</td>
                            <td>{appt.time}</td>
                            <td>{appt.doctor ? appt.doctor.name : 'Unknown'}</td>
                            <td>
                              <span style={{
                                  padding: '4px 10px', 
                                  borderRadius: '12px', 
                                  background: appt.status === 'PENDING' ? '#FFF3CD' : appt.status === 'APPROVED' ? '#D1E7DD' : '#F8D7DA',
                                  color: appt.status === 'PENDING' ? '#856404' : appt.status === 'APPROVED' ? '#0F5132' : '#721C24',
                                  fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                              }}>
                                  {appt.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
          )}

          {/* ---- TAB 3: MEDICAL RECORDS ---- */}
          {activeTab === 'records' && (
              <section className="doctors-section">
                <h3 style={{fontSize:'1.2rem', marginBottom:'20px'}}>Medical History</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Treatment</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRecords.length === 0 ? (
                        <tr><td colSpan={4} style={{textAlign:'center', padding:'20px', fontSize:'0.9rem', color:'#777'}}>No Records Found</td></tr>
                      ) : (
                        myRecords.map(rec => (
                          <tr key={rec.id}>
                            <td>{rec.recordDate}</td>
                            <td>{rec.diagnosis}</td>
                            <td>{rec.treatment}</td>
                            <td style={{maxWidth: '300px'}}>{rec.notes}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;