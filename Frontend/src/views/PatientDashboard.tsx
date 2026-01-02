import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.Config.ts'; 
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

// Doctor Interface
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

  //STATES for Booking 
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
      
      const parsedPatient = JSON.parse(storedData);
      setPatient(parsedPatient);

      try {
        setLoading(true);
        const appRes = await api.get('/appointments');
        const patientAppointments = appRes.data.filter((a: Appointment) => a.patient?.id === parsedPatient.id);
        setMyAppointments(patientAppointments);

        const recRes = await api.get('/medical-records');
        const patientRecords = recRes.data.filter((r: MedicalRecord) => r.patient?.id === parsedPatient.id);
        setMyRecords(patientRecords);

        try {
            const docRes = await api.get('/doctors'); 
            setDoctors(docRes.data);
        } catch(e) { console.log("Doctors loading failed", e); }

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

  if (!patient) return <div>Loading...</div>;

  const sidebarColor = 'white'; 
  const activeTextColor = '#0056b3'; 

  return (
    <div className={`dashboard-layout`}>
      
      {/* --- SIDEBAR --- */}
      <div className="dashboard-sidebar" style={{ background: sidebarColor, color: '#333', borderRight: '1px solid #eee' }}>
        <div className="dashboard-logo" style={{borderBottom:'1px solid #eee'}}>
          <h2 style={{color: '#0056b3'}}>My Health</h2>
        </div>
        
        <nav className="dashboard-nav">
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
            <CalendarIcon /> <span>My Appointments</span>
          </button>

          <button 
            onClick={() => setActiveTab('records')} 
            className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
            style={activeTab === 'records' ? { color: activeTextColor, background: '#eef2ff' } : { color: '#555' }}
          >
            <ListIcon /> <span>Medical Records</span>
          </button>

          <button 
            onClick={() => navigate('/home')} 
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
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, {patient.firstName} {patient.lastName} 👋</h1>
        </header>

        <div className="dashboard-content-wrapper" style={{padding: 0, overflow: 'hidden'}}>
          
          <div className="patient-slider-viewport">
            <div className={`patient-slider-track v-pos-${activeTab}`}>

              {/* DASHBOARD */}
              <div className="patient-slider-slide">
                  <div className="dashboard-content p-4">
                    <div className="stat-card profile-card" style={{borderLeft: '5px solid #0056b3'}}>
                      <h3>My Profile</h3>
                      <div style={{fontSize: '0.95rem', color: '#555', marginTop: '10px', lineHeight: '1.6'}}>
                        <p><strong>Email:</strong> {patient.email}</p>
                        <p><strong>Phone:</strong> {patient.phone}</p>
                        <p><strong>Age:</strong> {patient.age}</p>
                        <p><strong>Address:</strong> {patient.address}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <h3>Upcoming Appointments</h3>
                      <p style={{color: '#0056b3'}}>{myAppointments.length}</p>
                    </div>
                  </div>
              </div>

              {/* APPOINTMENTS TAB */}
              <div className="patient-slider-slide">
                <section className="doctors-section p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="m-0">My Appointments History</h3>
                      <button 
                        className={`btn ${showBookingForm ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        style={{ backgroundColor: showBookingForm ? '#dc3545' : '#0056b3', borderColor: 'transparent' }}
                      >
                        {showBookingForm ? 'Cancel Booking' : '+ Book New Appointment'}
                      </button>
                  </div>

                  {/* BOOTSTRAP BOOKING FORM */}
                  {showBookingForm && (
                      <div className="card shadow-sm mb-4 booking-form-card bg-light border-0">
                          <div className="card-body p-4">
                              <h4 className="card-title mb-4 text-primary">📅 Book New Appointment</h4>
                              
                              <div className="row g-3">
                                  {/* Doctor Select */}
                                  <div className="col-md-12">
                                      <label className="form-label fw-bold">Select Doctor</label>
                                      <select 
                                        className="form-select" 
                                        value={newBooking.doctorId} 
                                        onChange={(e) => setNewBooking({...newBooking, doctorId: e.target.value})}
                                      >
                                          <option value="">-- Choose a Specialist --</option>
                                          {doctors.map(d => (
                                              <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                          ))}
                                      </select>
                                  </div>

                                  {/* Date Picker */}
                                  <div className="col-md-6">
                                      <label className="form-label fw-bold">Date</label>
                                      <input 
                                        type="date" 
                                        className="form-control" 
                                        value={newBooking.date} 
                                        onChange={e => setNewBooking({...newBooking, date: e.target.value})}
                                      />
                                  </div>
                                  
                                  {/* Time Slot */}
                                  <div className="col-md-6">
                                      <label className="form-label fw-bold">Time Slot</label>
                                      <select 
                                        className="form-select" 
                                        value={newBooking.time} 
                                        onChange={e => setNewBooking({...newBooking, time: e.target.value})}
                                      >
                                          <option value="">-- Choose Time --</option>
                                          {timeSlots.map(slot => (
                                              <option key={slot} value={slot}>{slot}</option>
                                          ))}
                                      </select>
                                  </div>

                                  {/* Reason / Notes */}
                                  <div className="col-12">
                                      <label className="form-label fw-bold">Reason for Visit</label>
                                      <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g. Annual checkup, Flu symptoms..." 
                                        value={newBooking.notes} 
                                        onChange={e => setNewBooking({...newBooking, notes: e.target.value})}
                                      />
                                  </div>

                                  {/* Confirm Button */}
                                  <div className="col-12 text-end mt-4">
                                      <button 
                                        className="btn btn-success fw-bold px-4 py-2" 
                                        onClick={handleBookAppointment}
                                        style={{ backgroundColor: '#28a745', border: 'none' }}
                                      >
                                        Confirm Booking
                                      </button>
                                  </div>
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
                          <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>No Appointments Found</td></tr>
                        ) : (
                          myAppointments.map(appt => (
                            <tr key={appt.id}>
                              <td>{appt.date}</td>
                              <td>{appt.time}</td>
                              <td>{appt.doctor ? appt.doctor.name : 'Unknown'}</td>
                              <td>
                                <span style={{
                                    padding: '5px 12px', 
                                    borderRadius: '20px', 
                                    background: appt.status === 'PENDING' ? '#FFF3CD' : appt.status === 'APPROVED' ? '#D1E7DD' : '#F8D7DA',
                                    color: appt.status === 'PENDING' ? '#856404' : appt.status === 'APPROVED' ? '#0F5132' : '#721C24',
                                    fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase'
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
              </div>

              {/* MEDICAL RECORDS TAB */}
              <div className="patient-slider-slide">
                <section className="doctors-section p-4">
                  <h3>My Medical Records</h3>
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
                          <tr><td colSpan={4} style={{textAlign:'center', padding:'20px'}}>No Medical Records Found</td></tr>
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
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;