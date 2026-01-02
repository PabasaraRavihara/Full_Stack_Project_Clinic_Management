import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import { UserIcon, SignInIcon, ListIcon, PlusIcon, UsersIcon, CalendarIcon } from '../components/Icons.tsx';

// --- Interfaces ---
interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  age: string;
  gender: string;
  password?: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  patient: Patient;
}

interface MedicalRecord {
  id: number;
  diagnosis: string;
  treatment: string;
  notes: string;
  recordDate: string;
  patient: Patient;
}

interface Billing {
  billId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  appointment: {
      id: number;
      patient?: Patient;
  };
}

const DoctorDashboard = () => {
  const navigate = useNavigate();

  // --- States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'appointments' | 'records' | 'billing'>('dashboard');
  
  // Sub Tabs (View vs Add)
  const [patientSubTab, setPatientSubTab] = useState<'view' | 'add'>('view');
  const [appointmentSubTab, setAppointmentSubTab] = useState<'view' | 'add'>('view');
  const [recordSubTab, setRecordSubTab] = useState<'view' | 'add'>('view');
  const [billingSubTab, setBillingSubTab] = useState<'view' | 'add'>('view');

  // Data Lists
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [recordsList, setRecordsList] = useState<MedicalRecord[]>([]);
  const [billingsList, setBillingsList] = useState<Billing[]>([]);
  const [income, setIncome] = useState(0);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Forms State
  // [UPDATED] newPatient state password field 
  const [newPatient, setNewPatient] = useState<Patient>({ 
      firstName: '', lastName: '', email: '', phone: '', 
      address: '', age: '', gender: '', password: '' 
  });
  
  const [newAppointment, setNewAppointment] = useState({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
  const [newRecord, setNewRecord] = useState({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', recordDate: '' });
  const [newBill, setNewBill] = useState({ appointmentId: '', amount: '', paymentMethod: 'CASH', status: 'PAID' });

  const handleLogout = () => {
    localStorage.removeItem('doctorData');
    navigate('/doctor-login');
  };

  // --- API Calls (Fetch Data) ---
  const fetchData = async () => {
    try {
        const pRes = await api.get('/patients');
        setPatientsList(pRes.data);

        const aRes = await api.get('/appointments'); 
        setAppointmentsList(aRes.data);

        const rRes = await api.get('/medical-records');
        setRecordsList(rRes.data);

        const bRes = await api.get('/billings');
        setBillingsList(bRes.data);
        
        const total = bRes.data.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setIncome(total);
    } catch (err) {
        console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- Helper: Reset Forms ---
  const resetForms = () => {
      setIsEditing(false);
      setEditingId(null);
      // [UPDATED] Reset password field too
      setNewPatient({ firstName: '', lastName: '', email: '', phone: '', address: '', age: '', gender: '', password: '' });
      setNewAppointment({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
      setNewRecord({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', recordDate: '' });
      setNewBill({ appointmentId: '', amount: '', paymentMethod: 'CASH', status: 'PAID' });
  };

  // --- NEW: Handle Status Update (Accept/Reject) ---
  const handleStatusUpdate = async (id: number, status: string) => {
    if(!window.confirm(`Are you sure you want to ${status} this appointment?`)) return;

    try {
        await api.put(`/appointments/${id}/status?status=${status}`);
        alert(`Appointment ${status} Successfully!`);
        fetchData(); 
    } catch (error) {
        console.error(error);
        alert("Update Failed!");
    }
  };

  // --- ACTIONS: PATIENTS (Add, Update, Delete) ---
  const handleSavePatient = async () => {
    try {
        // [ADDED]  Patient  Password 
        if (!isEditing && !newPatient.password) {
            alert("Please enter a password for the new patient!");
            return;
        }

        if (isEditing && editingId) {
            await api.put(`/patients/${editingId}`, newPatient);
            alert("Patient Updated!");
        } else {
            await api.post('/patients', newPatient);
            alert("Patient Added Successfully!");
        }
        resetForms();
        fetchData();
        setPatientSubTab('view');
    } catch (error) { 
        console.error(error);
        alert("Error Saving Patient! (Check if Email is duplicate)"); 
    }
  };

  const handleDeletePatient = async (id: number) => {
      if(!window.confirm("Are you sure you want to delete this patient?")) return;
      try {
          await api.delete(`/patients/${id}`);
          alert("Patient Deleted!");
          fetchData();
      } catch { alert("Error Deleting Patient!"); }
  };

  const startEditPatient = (p: Patient) => {
      // [UPDATED] Edit  Password (Empty )
      setNewPatient({ ...p, password: '' }); 
      setIsEditing(true);
      setEditingId(p.id!);
      setPatientSubTab('add');
  };

  // --- ACTIONS: APPOINTMENTS (Add, Update, Delete) ---
  const handleSaveAppointment = async () => {
    try {
       const appointmentTime = `${newAppointment.date}T${newAppointment.time}:00`;
       const payload = { ...newAppointment, time: newAppointment.time + ":00", appointmentTime, status: "SCHEDULED" };
       
       if (isEditing && editingId) {
           await api.put(`/appointments/${editingId}`, payload);
           alert("Appointment Updated!");
       } else {
           await api.post('/appointments', payload);
           alert("Appointment Booked!");
       }
       resetForms();
       fetchData();
       setAppointmentSubTab('view');
    } catch { alert("Error Saving Appointment!"); }
  };

  const handleDeleteAppointment = async (id: number) => {
      if(!window.confirm("Cancel this appointment?")) return;
      try {
          await api.delete(`/appointments/${id}`);
          fetchData();
      } catch { alert("Error Deleting Appointment!"); }
  };

  const startEditAppointment = (a: Appointment) => {
      setNewAppointment({
          patientId: a.patient?.id?.toString() || '',
          doctorId: '1', 
          date: a.date,
          time: a.time,
          notes: ''
      });
      setIsEditing(true);
      setEditingId(a.id);
      setAppointmentSubTab('add');
  };

  // --- ACTIONS: RECORDS (Add, Update, Delete) ---
  const handleSaveRecord = async () => {
    try { 
        if (isEditing && editingId) {
            await api.put(`/medical-records/${editingId}`, newRecord); 
            alert("Record Updated!"); 
        } else {
            await api.post('/medical-records', newRecord); 
            alert("Record Added!"); 
        }
        resetForms(); 
        fetchData(); 
        setRecordSubTab('view'); 
    } catch { 
        alert("Error Saving Record!"); 
    }
  };

  const handleDeleteRecord = async (id: number) => {
      if(!window.confirm("Delete this record?")) return;
      try {
          await api.delete(`/medical-records/${id}`);
          fetchData();
      } catch { alert("Error Deleting Record!"); }
  };

  const startEditRecord = (r: MedicalRecord) => {
      setNewRecord({
          patientId: r.patient?.id?.toString() || '',
          doctorId: '1', 
          diagnosis: r.diagnosis,
          treatment: r.treatment,
          notes: r.notes,
          recordDate: r.recordDate
      });
      
      setIsEditing(true);
      setEditingId(r.id);
      setRecordSubTab('add');
  };

  // --- ACTIONS: BILLING (Add, Delete, Print) ---
  const handleSaveBill = async () => {
      try {
          const payload = { 
              amount: newBill.amount, 
              paymentMethod: newBill.paymentMethod, 
              status: newBill.status, 
              paymentDate: new Date().toISOString().slice(0, 19), 
              appointment: { id: newBill.appointmentId } 
          };
          
          if(isEditing && editingId) {
             await api.put(`/billings/${editingId}`, payload);
             alert("Bill Updated!");
          } else {
             await api.post('/billings', payload);
             alert("Bill Created!");
          }
          resetForms();
          fetchData();
          setBillingSubTab('view');
      } catch { alert("Error Saving Bill!"); }
  };

  const handleDeleteBill = async (id: number) => {
      if(!window.confirm("Delete this bill?")) return;
      try {
          await api.delete(`/billings/${id}`);
          fetchData();
      } catch { alert("Error Deleting Bill!"); }
  };

  const startEditBill = (b: Billing) => {
      setNewBill({
          appointmentId: b.appointment?.id?.toString() || '',
          amount: b.amount.toString(),
          paymentMethod: b.paymentMethod,
          status: b.status
      });
      setIsEditing(true);
      setEditingId(b.billId);
      setBillingSubTab('add');
  };

  // --- PRINT BILL FUNCTION ---
  const printBill = (bill: Billing) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const patientName = bill.appointment.patient ? `${bill.appointment.patient.firstName} ${bill.appointment.patient.lastName}` : "Unknown Patient";
      
      const invoiceHTML = `
        <html>
          <head>
            <title>Invoice #${bill.billId}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .logo h1 { color: #2E7D32; margin: 0; }
              .details { text-align: right; }
              .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .info-table th { background: #f9f9f9; padding: 10px; text-align: left; }
              .info-table td { padding: 10px; border-bottom: 1px solid #eee; }
              .total { margin-top: 30px; text-align: right; font-size: 1.5rem; font-weight: bold; color: #2E7D32; }
              .footer { margin-top: 50px; text-align: center; font-size: 0.8rem; color: #777; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <div class="logo">
                  <h1>HealthCare+ Clinic</h1>
                  <p>No 123, Wellness Road, Colombo</p>
                </div>
                <div class="details">
                  <p><strong>Bill ID:</strong> #${bill.billId}</p>
                  <p><strong>Date:</strong> ${new Date(bill.paymentDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> ${bill.status}</p>
                </div>
              </div>

              <h3>Patient Information</h3>
              <p><strong>Name:</strong> ${patientName}</p>
              <p><strong>Appointment ID:</strong> ${bill.appointment.id}</p>

              <table class="info-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align:right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Medical Consultation & Services</td>
                    <td style="text-align:right">Rs. ${bill.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total">
                Total: Rs. ${bill.amount.toFixed(2)}
              </div>

              <div class="footer">
                <p>Thank you for choosing HealthCare+!</p>
                <p>This is a computer-generated invoice.</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
    }
  };

  // --- Styles ---
  const sidebarColor = '#2E7D32'; 
  const activeTextColor = '#2E7D32'; 
  const btnStyle = { padding: '5px 10px', margin: '0 5px', border: 'none', borderRadius: '5px', cursor: 'pointer', color: 'white' };

  return (
    <div className="dashboard-layout">
      {/* --- SIDEBAR --- */}
      <div className="dashboard-sidebar" style={{ backgroundColor: sidebarColor }}>
        <div className="dashboard-logo"><h2 style={{margin:0}}>Doctor Portal</h2></div>
        <nav className="dashboard-nav">
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} style={activeTab === 'dashboard' ? { color: activeTextColor } : {}}><UserIcon /> <span>Dashboard</span></button>
          <button onClick={() => setActiveTab('patients')} className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} style={activeTab === 'patients' ? { color: activeTextColor } : {}}><UsersIcon /> <span>Patients</span></button>
          <button onClick={() => setActiveTab('appointments')} className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} style={activeTab === 'appointments' ? { color: activeTextColor } : {}}><CalendarIcon /> <span>Appointments</span></button>
          <button onClick={() => setActiveTab('records')} className={`nav-item ${activeTab === 'records' ? 'active' : ''}`} style={activeTab === 'records' ? { color: activeTextColor } : {}}><ListIcon /> <span>Records</span></button>
          <button onClick={() => setActiveTab('billing')} className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} style={activeTab === 'billing' ? { color: activeTextColor } : {}}><ListIcon /> <span>Billing</span></button>
        </nav>
        <div className="dashboard-logout"><button onClick={handleLogout} className="nav-item"><SignInIcon /> <span>Logout</span></button></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="dashboard-main">
        <header className="dashboard-header"><h1>Doctor Dashboard</h1></header>
        <div className="dashboard-content-wrapper">
          
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <section className="dashboard-content">
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>Total Patients</h3><p style={{color: '#2E7D32', fontSize: '2.5rem'}}>{patientsList.length}</p></div>
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>Appointments</h3><p style={{color: '#1565C0', fontSize: '2.5rem'}}>{appointmentsList.length}</p></div>
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>Income</h3><p style={{color: '#2E7D32', fontSize: '2.5rem'}}>Rs. {income}</p></div>
            </section>
          )}

          {/* 2. PATIENTS TAB */}
          {activeTab === 'patients' && (
            <section className="doctors-section">
              <div className="action-buttons-container">
                <button className={`action-btn ${patientSubTab === 'view' ? 'active' : ''}`} onClick={() => {setPatientSubTab('view'); resetForms();}}><ListIcon /> View List</button>
                <button className={`action-btn ${patientSubTab === 'add' ? 'active' : ''}`} onClick={() => {setPatientSubTab('add'); resetForms();}}><PlusIcon /> Add Patient</button>
              </div>

              {patientSubTab === 'view' ? (
                  <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
                        <tbody>
                            {patientsList.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.firstName} {p.lastName}</td>
                                    <td>{p.email}</td>
                                    <td>{p.phone}</td>
                                    <td>
                                        <button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditPatient(p)}>Edit</button>
                                        <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeletePatient(p.id!)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="form-container">
                      <h3>{isEditing ? 'Edit Patient' : 'Register New Patient'}</h3>
                      <form className="admin-form">
                          <div className="form-row">
                              <div className="form-group"><label>First Name</label><input value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})}/></div>
                              <div className="form-group"><label>Last Name</label><input value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})}/></div>
                          </div>
                          <div className="form-row">
                              <div className="form-group"><label>Email</label><input value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})}/></div>
                              <div className="form-group"><label>Phone</label><input value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})}/></div>
                          </div>
                          <div className="form-row">
                              <div className="form-group"><label>Age</label><input value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})}/></div>
                              <div className="form-group"><label>Gender</label><input value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}/></div>
                          </div>
                          <div className="form-group"><label>Address</label><input value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})}/></div>
                          
                          {/* --- [ADDED] PASSWORD FIELD --- */}
                          <div className="form-group">
                              <label>Password</label>
                              <input 
                                  type="text" 
                                  placeholder={isEditing ? "Leave blank to keep current" : "Set Password"} 
                                  value={newPatient.password || ''} 
                                  onChange={e => setNewPatient({...newPatient, password: e.target.value})}
                              />
                          </div>
                          {/* ----------------------------- */}

                          <button type="button" className="save-btn" onClick={handleSavePatient}>{isEditing ? 'Update Patient' : 'Save Patient'}</button>
                      </form>
                  </div>
              )}
            </section>
          )}

          {/* 3. APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <section className="doctors-section">
              <div className="action-buttons-container">
                <button className={`action-btn ${appointmentSubTab === 'view' ? 'active' : ''}`} onClick={() => {setAppointmentSubTab('view'); resetForms();}}><ListIcon /> View List</button>
                <button className={`action-btn ${appointmentSubTab === 'add' ? 'active' : ''}`} onClick={() => {setAppointmentSubTab('add'); resetForms();}}><PlusIcon /> Book Appointment</button>
              </div>

              {appointmentSubTab === 'view' ? (
                  <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Date</th><th>Time</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {appointmentsList.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>{a.date}</td>
                                    <td>{a.time}</td>
                                    <td>{a.patient ? a.patient.firstName + ' ' + a.patient.lastName : 'Unknown'}</td>
                                    <td>
                                        <span style={{fontWeight:'bold', color: a.status === 'PENDING' ? 'orange' : a.status === 'APPROVED' ? 'green' : 'red'}}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td>
                                        {a.status === 'PENDING' && (
                                            <>
                                                <button style={{...btnStyle, background:'#28a745'}} onClick={() => handleStatusUpdate(a.id, 'APPROVED')}>Accept</button>
                                                <button style={{...btnStyle, background:'#dc3545'}} onClick={() => handleStatusUpdate(a.id, 'REJECTED')}>Reject</button>
                                            </>
                                        )}
                                        <button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditAppointment(a)}>Edit</button>
                                        <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeleteAppointment(a.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="form-container">
                      <h3>{isEditing ? 'Edit Appointment' : 'Book Appointment'}</h3>
                      <form className="admin-form">
                          <div className="form-row">
                              <div className="form-group"><label>Patient ID</label><input type="number" value={newAppointment.patientId} onChange={e => setNewAppointment({...newAppointment, patientId: e.target.value})}/></div>
                              <div className="form-group"><label>Doctor ID</label><input type="number" value={newAppointment.doctorId} onChange={e => setNewAppointment({...newAppointment, doctorId: e.target.value})}/></div>
                          </div>
                          <div className="form-row">
                              <div className="form-group"><label>Date</label><input type="date" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})}/></div>
                              <div className="form-group"><label>Time</label><input type="time" value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})}/></div>
                          </div>
                          <div className="form-group"><label>Notes</label><input value={newAppointment.notes} onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})}/></div>
                          <button type="button" className="save-btn" style={{background:'#2E7D32'}} onClick={handleSaveAppointment}>{isEditing ? 'Update' : 'Confirm'}</button>
                      </form>
                  </div>
              )}
            </section>
          )}

          {/* 4. RECORDS & 5. BILLING (Existing code) */}
          {activeTab === 'records' && (
            <section className="doctors-section">
               <div className="action-buttons-container">
                   <button className={`action-btn ${recordSubTab === 'view' ? 'active' : ''}`} onClick={() => {setRecordSubTab('view'); resetForms();}}>View List</button>
                   <button className={`action-btn ${recordSubTab === 'add' ? 'active' : ''}`} onClick={() => {setRecordSubTab('add'); resetForms();}}>Add Record</button>
               </div>
               
               {recordSubTab === 'view' ? (
                   <div className="table-container">
                       <table className="data-table">
                           <thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Treatment</th><th>Actions</th></tr></thead>
                           <tbody>
                               {recordsList.map(r => (
                                   <tr key={r.id}>
                                       <td>{r.recordDate}</td>
                                       <td>{r.patient ? r.patient.firstName : 'N/A'}</td>
                                       <td>{r.diagnosis}</td>
                                       <td>{r.treatment}</td>
                                       <td>
                                           <button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditRecord(r)}>Edit</button>
                                           <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeleteRecord(r.id)}>Delete</button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               ) : (
                   <div className="form-container">
                       <h3>{isEditing ? 'Edit Medical Record' : 'Add Medical Record'}</h3>
                       <form className="admin-form">
                           <div className="form-group"><label>Patient ID</label><input type="number" value={newRecord.patientId} onChange={e => setNewRecord({...newRecord, patientId: e.target.value})} /></div>
                           <div className="form-group"><label>Doctor ID</label><input type="number" value={newRecord.doctorId} onChange={e => setNewRecord({...newRecord, doctorId: e.target.value})} /></div>
                           <div className="form-group"><label>Diagnosis</label><input value={newRecord.diagnosis} onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})} /></div>
                           <div className="form-group"><label>Treatment</label><input value={newRecord.treatment} onChange={e => setNewRecord({...newRecord, treatment: e.target.value})} /></div>
                           <button type="button" className="save-btn" style={{background:'#2E7D32'}} onClick={handleSaveRecord}>{isEditing ? 'Update Record' : 'Save Record'}</button>
                       </form>
                   </div>
               )}
            </section>
          )}

          {activeTab === 'billing' && (
            <section className="doctors-section">
                <div className="action-buttons-container">
                    <button className={`action-btn ${billingSubTab === 'view' ? 'active' : ''}`} onClick={() => {setBillingSubTab('view'); resetForms();}}>View</button>
                    <button className={`action-btn ${billingSubTab === 'add' ? 'active' : ''}`} onClick={() => {setBillingSubTab('add'); resetForms();}}>Create Bill</button>
                </div>
                {billingSubTab === 'view' ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead><tr><th>Bill ID</th><th>Appt ID</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {billingsList.map(b => (
                                    <tr key={b.billId}>
                                        <td>{b.billId}</td>
                                        <td>{b.appointment ? b.appointment.id : 'N/A'}</td>
                                        <td>Rs. {b.amount}</td>
                                        <td>{b.status}</td>
                                        <td>
                                            <button style={{...btnStyle, background:'#007BFF'}} onClick={() => printBill(b)}>Print 🖨️</button>
                                            <button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditBill(b)}>Edit</button>
                                            <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeleteBill(b.billId)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="form-container">
                        <h3>{isEditing ? 'Edit Bill' : 'Create Bill'}</h3>
                        <form className="admin-form">
                            <div className="form-group"><label>Appt ID</label><input type="number" value={newBill.appointmentId} onChange={e=>setNewBill({...newBill, appointmentId: e.target.value})}/></div>
                            <div className="form-group"><label>Amount</label><input type="number" value={newBill.amount} onChange={e=>setNewBill({...newBill, amount: e.target.value})}/></div>
                            <div className="form-group"><label>Status</label><input type="text" value={newBill.status} onChange={e=>setNewBill({...newBill, status: e.target.value})}/></div>
                            <button type="button" className="save-btn" onClick={handleSaveBill}>{isEditing ? 'Update' : 'Generate Bill'}</button>
                        </form>
                    </div>
                )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;