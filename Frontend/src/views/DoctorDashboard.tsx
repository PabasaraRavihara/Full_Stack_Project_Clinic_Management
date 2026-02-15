import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.Config'; 
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
  doctor: Doctor; // Doctor විස්තර මෙතනට එකතු කළා
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
  
  // Sub Tabs
  const [patientSubTab, setPatientSubTab] = useState<'view' | 'add'>('view');
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
  const [newPatient, setNewPatient] = useState<Patient>({ 
      firstName: '', lastName: '', email: '', phone: '', 
      address: '', age: '', gender: '', password: '' 
  });
  
  const [newRecord, setNewRecord] = useState({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', recordDate: '' });
  const [newBill, setNewBill] = useState({ appointmentId: '', amount: '', paymentMethod: 'CASH', status: 'PAID' });

  const handleLogout = () => {
    localStorage.removeItem('doctorData');
    navigate('/doctor-login');
  };

  // ✅ HELPER: Token Extraction
  const getAuthConfig = () => {
      const storedData = localStorage.getItem('doctorData');
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

  // --- API Calls (Fetch Data) ---
  const fetchData = async () => {
    try {
        const config = getAuthConfig();
        const storedData = localStorage.getItem('doctorData');
        if (!storedData) return;

        const loggedInUser = JSON.parse(storedData);
        
        // ✅ ඉතාම වැදගත් FIX එක:
        // ඔබේ login response එක අනුව ID එක තිබෙන්නේ loggedInUser.doctor.id ලෙසයි
        const docId = loggedInUser.doctor ? loggedInUser.doctor.id : loggedInUser.id; 

        // 1. Patients ලබා ගැනීම
        const pRes = await api.get('/patients', config);
        setPatientsList(pRes.data);

        if (docId) {
            // 2. ✅ Appointments ලබා ගැනීම (දොස්තරට අදාළ ඒවා පමණක් Backend එකෙන් ගනියි)
            const aRes = await api.get(`/appointments/doctor/${docId}`, config); 
            setAppointmentsList(aRes.data);
        }

        // 3. Records ලබා ගැනීම
        const rRes = await api.get('/medical-records', config);
        setRecordsList(rRes.data);

        // 4. Billings ලබා ගැනීම
        const bRes = await api.get('/billings', config);
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
      setNewPatient({ firstName: '', lastName: '', email: '', phone: '', address: '', age: '', gender: '', password: '' });
      setNewRecord({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', recordDate: '' });
      setNewBill({ appointmentId: '', amount: '', paymentMethod: 'CASH', status: 'PAID' });
  };

  // --- ACTIONS: PATIENTS ---
  const handleSavePatient = async () => {
    try {
        if (!isEditing && !newPatient.password) {
            alert("Please enter a password for the new patient!");
            return;
        }

        const config = getAuthConfig();

        if (isEditing && editingId) {
            await api.put(`/patients/${editingId}`, newPatient, config);
            alert("Patient Updated!");
        } else {
            await api.post('/patients', newPatient, config);
            alert("Patient Added Successfully!");
        }
        
        resetForms();
        setTimeout(() => { fetchData(); }, 500); 
        setPatientSubTab('view');
    } catch (error) { 
        console.error(error);
        alert("Error Saving Patient! (Check if Email is duplicate)"); 
    }
  };

  const handleDeletePatient = async (id: number) => {
      if(!window.confirm("Are you sure you want to delete this patient?")) return;
      try {
          const config = getAuthConfig();
          await api.delete(`/patients/${id}`, config);
          alert("Patient Deleted!");
          fetchData();
      } catch (error) { 
          console.error(error);
          alert("Error Deleting Patient!"); 
      }
  };

  const startEditPatient = (p: Patient) => {
      setNewPatient({ ...p, password: '' }); 
      setIsEditing(true);
      setEditingId(p.id!);
      setPatientSubTab('add');
  };

  // --- ACTIONS: APPOINTMENTS ---
  const handleStatusUpdate = async (id: number, status: string) => {
    const action = status === 'APPROVED' ? 'Accept' : 'Reject';
    if(!window.confirm(`Are you sure you want to ${action} this appointment?`)) return;

    try {
        const config = getAuthConfig();
        await api.put(`/appointments/${id}/status?status=${status}`, {}, config);
        
        alert(`Appointment ${status === 'APPROVED' ? 'Accepted' : 'Rejected'}!`);
        if(status === 'REJECTED') {
             alert("Patient has been notified via Email.");
        }
        fetchData(); 
    } catch (error) {
        console.error(error);
        alert("Update Failed!");
    }
  };

  // --- ACTIONS: RECORDS ---
  const handleSaveRecord = async () => {
    try { 
        const config = getAuthConfig();
        
        const payload = {
            ...newRecord,
            recordDate: newRecord.recordDate ? newRecord.recordDate : new Date().toISOString().split('T')[0]
        };

        if (isEditing && editingId) {
            await api.put(`/medical-records/${editingId}`, payload, config); 
            alert("Record Updated!"); 
        } else {
            await api.post('/medical-records', payload, config); 
            alert("Record Added!"); 
        }
        resetForms(); 
        fetchData(); 
        setRecordSubTab('view'); 
    } catch (err) { 
        console.error(err);
        alert("Error Saving Record!"); 
    }
  };

  const handleDeleteRecord = async (id: number) => {
      if(!window.confirm("Delete this record?")) return;
      try {
          const config = getAuthConfig();
          await api.delete(`/medical-records/${id}`, config);
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

  // --- ACTIONS: BILLING (FIXED) ---
  const handleSaveBill = async () => {
      try {
          const config = getAuthConfig();
          
          const payload = { 
              amount: Number(newBill.amount), 
              paymentMethod: newBill.paymentMethod, 
              status: newBill.status, 
              paymentDate: new Date().toISOString().slice(0, 19), 
              appointment: { id: Number(newBill.appointmentId) } 
          };
          
          if(isEditing && editingId) {
             await api.put(`/billings/${editingId}`, payload, config);
             alert("Bill Updated!");
          } else {
             await api.post('/billings', payload, config);
             alert("Bill Created!");
          }
          resetForms();
          fetchData();
          setBillingSubTab('view');
      } catch (error) { 
          console.error(error); 
          alert("Error Saving Bill!"); 
      }
  };

  const handleDeleteBill = async (id: number) => {
      if(!window.confirm("Delete this bill?")) return;
      try {
          const config = getAuthConfig();
          await api.delete(`/billings/${id}`, config);
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

  // --- PRINT BILL ---
  const printBill = (bill: Billing) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    const patientName = bill.appointment?.patient ? `${bill.appointment.patient.firstName} ${bill.appointment.patient.lastName}` : "Unknown Patient";
    const billDate = new Date(bill.paymentDate).toLocaleDateString();
    const invoiceHTML = `<html><body><h2>Healthcare+ Bill</h2><p>Amount: Rs. ${bill.amount}</p><script>window.print();</script></body></html>`;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

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
          
          {activeTab === 'dashboard' && (
            <section className="dashboard-content">
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>Total Patients</h3><p style={{color: '#2E7D32', fontSize: '2.5rem'}}>{patientsList.length}</p></div>
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>My Appointments</h3><p style={{color: '#1565C0', fontSize: '2.5rem'}}>{appointmentsList.length}</p></div>
              <div className="stat-card" style={{backgroundColor: '#E8F5E9'}}><h3>Income</h3><p style={{color: '#2E7D32', fontSize: '2.5rem'}}>Rs. {income}</p></div>
            </section>
          )}

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
                                    <td>{p.id}</td><td>{p.firstName} {p.lastName}</td><td>{p.email}</td><td>{p.phone}</td>
                                    <td><button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditPatient(p)}>Edit</button>
                                    <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeletePatient(p.id!)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="form-container">
                      <form className="admin-form">
                          <input placeholder="First Name" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} /><br/>
                          <input placeholder="Last Name" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} /><br/>
                          <button type="button" className="save-btn" onClick={handleSavePatient}>Save</button>
                      </form>
                  </div>
              )}
            </section>
          )}

          {activeTab === 'appointments' && (
            <section className="doctors-section">
               <div className="table-container">
                    <h3 style={{marginBottom:'15px', color:'#2E7D32'}}>My Appointment Requests</h3>
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Date</th><th>Time</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {appointmentsList.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td><td>{a.date}</td><td>{a.time}</td>
                                    <td>{a.patient ? a.patient.firstName : 'Unknown'}</td>
                                    <td><span style={{fontWeight:'bold', color: a.status === 'PENDING' ? 'orange' : 'green'}}>{a.status}</span></td>
                                    <td>
                                        {a.status === 'PENDING' && (
                                            <>
                                                <button style={{...btnStyle, background:'#28a745'}} onClick={() => handleStatusUpdate(a.id, 'APPROVED')}>Accept</button>
                                                <button style={{...btnStyle, background:'#dc3545'}} onClick={() => handleStatusUpdate(a.id, 'REJECTED')}>Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
            </section>
          )}

          {activeTab === 'records' && (
            <section className="doctors-section">
               <div className="action-buttons-container">
                   <button className={`action-btn ${recordSubTab === 'view' ? 'active' : ''}`} onClick={() => {setRecordSubTab('view'); resetForms();}}>View List</button>
                   <button className={`action-btn ${recordSubTab === 'add' ? 'active' : ''}`} onClick={() => {setRecordSubTab('add'); resetForms();}}>Add Record</button>
               </div>
               {recordSubTab === 'view' ? (
                   <table className="data-table">
                       <thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Actions</th></tr></thead>
                       <tbody>
                           {recordsList.map(r => (
                               <tr key={r.id}>
                                   <td>{r.recordDate}</td><td>{r.patient?.firstName}</td><td>{r.diagnosis}</td>
                                   <td><button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeleteRecord(r.id)}>Delete</button></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               ) : (
                   <div className="form-container">
                       <input placeholder="Patient ID" onChange={e => setNewRecord({...newRecord, patientId: e.target.value})} /><br/>
                       <button className="save-btn" onClick={handleSaveRecord}>Save</button>
                   </div>
               )}
            </section>
          )}

          {activeTab === 'billing' && (
            <section className="doctors-section">
                <div className="action-buttons-container">
                    <button className={`action-btn ${billingSubTab === 'view' ? 'active' : ''}`} onClick={() => {setBillingSubTab('view'); resetForms();}}>View History</button>
                    <button className={`action-btn ${billingSubTab === 'add' ? 'active' : ''}`} onClick={() => {setBillingSubTab('add'); resetForms();}}>Create Bill</button>
                </div>
                {billingSubTab === 'view' ? (
                    <table className="data-table">
                        <thead><tr><th>Bill ID</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {billingsList.map(b => (
                                <tr key={b.billId}>
                                    <td>{b.billId}</td><td>Rs. {b.amount}</td><td>{b.status}</td>
                                    <td><button style={{...btnStyle, background:'#007BFF'}} onClick={() => printBill(b)}>Print</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="form-container">
                        <input placeholder="Appt ID" type="number" onChange={e=>setNewBill({...newBill, appointmentId: e.target.value})}/><br/>
                        <button className="save-btn" onClick={handleSaveBill}>Generate</button>
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
