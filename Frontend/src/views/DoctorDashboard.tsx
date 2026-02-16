import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.Config'; 
import { UserIcon, SignInIcon, ListIcon, PlusIcon, UsersIcon, CalendarIcon } from '../components/Icons.tsx';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
  doctor: Doctor; 
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

 
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(true);

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
    localStorage.removeItem('token');
    setTimeout(() => {
    navigate('/doctor-login');
    }, 500);
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
   
    setIsLoading(true); 

    try {
      const config = getAuthConfig();
      const storedData = localStorage.getItem('doctorData');
      
      
      if (!storedData) {
        setIsLoading(false);
        return;
      }

      let docId = null;

      try {
        const parsed = JSON.parse(storedData);
        docId = parsed.doctorId || parsed.id;
      } catch (e) {
        console.warn("Using plain token. No ID available for filtering.");
      }

      // --- API Calls 
      
     
      const pRes = await api.get('/patients', config);
      setPatientsList(pRes.data);

     
      const rRes = await api.get('/medical-records', config);
      setRecordsList(rRes.data);

     
      const bRes = await api.get('/billings', config);
      setBillingsList(bRes.data);
      setIncome(bRes.data.reduce((acc: number, curr: any) => acc + curr.amount, 0));

     
      if (docId) {
        const aRes = await api.get(`/appointments/doctor/${docId}`, config); 
        setAppointmentsList(aRes.data);
      } else {
        console.error("ID not found. Showing empty appointment list for security.");
        setAppointmentsList([]); 
      }

    } catch (err) { 
      console.error("Error fetching data:", err); 
    } finally {

      setTimeout(() => setIsLoading(false), 800);
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
            toast.success('Patient Registered Successfully!', {
  duration: 4000,
  style: {
    background: '#2E7D32',
    color: '#fff',
  },
});
        }
        
        resetForms();
        setTimeout(() => { fetchData(); }, 500); 
        setPatientSubTab('view');
    } catch (error) { 
        console.error(error);
       toast.error('Failed to save patient. Please try again.'); 
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
  // ✅ Update 2: Record Update එකේදී Patient Name "N/A" වීම වැළැක්වීම
const handleSaveRecord = async () => {
    try { 
      const config = getAuthConfig();
      const payload = {
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        notes: newRecord.notes,
        recordDate: newRecord.recordDate || new Date().toISOString().split('T')[0],
        patient: { id: Number(newRecord.patientId) } // නම N/A වීම වැළැක්වීමට
      };

      if (isEditing && editingId) {
        await api.put(`/medical-records/${editingId}`, payload, config);
        alert("Record Updated!");
      } else {
        await api.post('/medical-records', payload, config);
        alert("Record Added!");
      }
      resetForms(); fetchData(); setRecordSubTab('view');
    } catch (err) { alert("Error Saving Record!"); }
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
        
        // Backend එක බලාපොරොත්තු වන නිවැරදි JSON ව්‍යුහය
        const payload = { 
            billId: editingId, // PUT එකේදී ID එක Payload එක තුළත් තිබීම වඩාත් සුදුසුයි
            amount: Number(newBill.amount), 
            paymentMethod: newBill.paymentMethod, 
            status: newBill.status, 
            paymentDate: new Date().toISOString().slice(0, 19).replace('T', ' '), // "yyyy-MM-dd HH:mm:ss" format එකට
            appointment: { id: Number(newBill.appointmentId) } 
        };
        
        if(isEditing && editingId) {
            // PUT request එක
            await api.put(`/billings/${editingId}`, payload, config);
            alert("Bill Updated Successfully!");
        } else {
            // POST request එක
            await api.post('/billings', payload, config);
            alert("Bill Created Successfully!");
        }
        resetForms(); fetchData(); setBillingSubTab('view');
    } catch (error) { 
        console.error("Billing Error Details:", error);
        alert("Error Saving Bill! Please check Appointment ID."); 
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
    
    if (!printWindow) {
      alert("Please allow popups to print the bill!");
      return;
    }

    const patientName = bill.appointment?.patient 
      ? `${bill.appointment.patient.firstName} ${bill.appointment.patient.lastName}` 
      : "Unknown Patient";
      
    const billDate = new Date(bill.paymentDate).toLocaleDateString();

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
                  <p><strong>Date:</strong> ${billDate}</p>
                  <p><strong>Status:</strong> ${bill.status}</p>
                </div>
              </div>

              <h3>Patient Information</h3>
              <p><strong>Name:</strong> ${patientName}</p>
              <p><strong>Appointment ID:</strong> ${bill.appointment?.id || 'N/A'}</p>

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
                    <td style="text-align:right">Rs. ${Number(bill.amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total">
                Total: Rs. ${Number(bill.amount).toFixed(2)}
              </div>

              <div class="footer">
                <p>Thank you for choosing HealthCare+!</p>
                <p>This is a computer-generated invoice.</p>
              </div>
            </div>
            <script>
              window.onload = function() { 
                window.print(); 
              }
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
  };

  const sidebarColor = '#2E7D32'; 
  const activeTextColor = '#2E7D32'; 
  const btnStyle = { padding: '5px 10px', margin: '0 5px', border: 'none', borderRadius: '5px', cursor: 'pointer', color: 'white' };

  return  (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="dashboard-layout"
    >
      
      {/* --- SIDEBAR () --- */}
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

{/* --- MAIN CONTENT AREA --- */}
      <main className="dashboard-main" style={{ backgroundColor: '#f8f9fa' }}>
        
       
        <header className="dashboard-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '15px 30px',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#333' }}>Doctor Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
              
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} | <span style={{ color: '#2E7D32' }}>{currentTime.toLocaleTimeString()}</span>
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ textAlign: 'right' }}>
               <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>Welcome back,</span>
               <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>Dr. Specialist 👋</span>
             </div>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                <UserIcon />
             </div>
          </div>
        </header>
        
        <div className="dashboard-content-wrapper" style={{ padding: '0 30px' }}>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* --- DASHBOARD TAB (Updated Stat Cards) --- */}
              {activeTab === 'dashboard' && (
                <section className="dashboard-content" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                  
                 
                  <div className="stat-card" style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderLeft: '5px solid #2E7D32',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <h3 style={{ color: '#666', fontSize: '1rem', marginBottom: '10px' }}>Total Patients</h3>
                    <p style={{ color: '#2E7D32', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{patientsList.length}</p>
                  </div>

              
                  <div className="stat-card" style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderLeft: '5px solid #1565C0',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}>
                    <h3 style={{ color: '#666', fontSize: '1rem', marginBottom: '10px' }}>My Appointments</h3>
                    <p style={{ color: '#1565C0', fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{appointmentsList.length}</p>
                  </div>

                
                  <div className="stat-card" style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderLeft: '5px solid #FF8F00',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }}>
                    <h3 style={{ color: '#666', fontSize: '1rem', marginBottom: '10px' }}>Total Income</h3>
                    <p style={{ color: '#2E7D32', fontSize: '2.2rem', fontWeight: 'bold', margin: 0 }}>
                      <span style={{ fontSize: '1.2rem' }}>Rs.</span> {income.toLocaleString()}
                    </p>
                  </div>

                </section>
              )}

              {/* --- PATIENTS TAB --- */}
  {activeTab === 'patients' && (
  <section className="doctors-section">
   
    <div className="action-buttons-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
      <button 
        className={`action-btn ${patientSubTab === 'view' ? 'active' : ''}`} 
        onClick={() => {setPatientSubTab('view'); resetForms();}}
      >
        <ListIcon /> View List
      </button>
      
      <button 
        className={`action-btn ${patientSubTab === 'add' ? 'active' : ''}`} 
        onClick={() => {setPatientSubTab('add'); resetForms();}}
      >
        <PlusIcon /> Add Patient
      </button>

     
      {patientSubTab === 'view' && (
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px', 
            borderRadius: '5px', 
            border: '1px solid #ccc', 
            marginLeft: 'auto', 
            width: '250px' 
          }}
        />
      )}
    </div>

   
  {patientSubTab === 'view' ? (

  patientsList.length === 0 ? (
    
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px', 
      background: 'white', 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      color: '#a0aec0',
      marginTop: '20px'
    }}>
      <div style={{ 
            marginBottom: '15px', 
            opacity: 0.6, 
            display: 'flex', 
            justifyContent: 'center',
            fontSize: '64px', 
            width: '100%'
          }}>
             <UsersIcon />
          </div>
      <h3 style={{ color: '#4a5568', marginBottom: '8px' }}>No Patients Registered Yet</h3>
      <p style={{ fontSize: '0.95rem' }}>It looks like your patient list is empty. Click <strong>"Add Patient"</strong> to register someone new.</p>
    </div>
  ) : (
  
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {patientsList
            .filter(p => 
              `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(p => (
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
  )
) : (
      /* Registration/Edit Form */
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
          <div className="form-group"><label>Password</label><input type="text" placeholder={isEditing ? "Leave blank to keep current" : "Set Password"} value={newPatient.password || ''} onChange={e => setNewPatient({...newPatient, password: e.target.value})}/></div>
          <button type="button" className="save-btn" onClick={handleSavePatient}>{isEditing ? 'Update Patient' : 'Save Patient'}</button>
        </form>
      </div>
    )}
  </section>
)}

{/* --- APPOINTMENTS TAB --- */}
{activeTab === 'appointments' && (
  <section className="doctors-section">
    <div className="table-container">
    
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ margin: 0, color: '#2E7D32' }}>My Appointment Requests</h3>
        
        <input 
          type="text" 
          placeholder="Search by Patient Name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '5px', 
            border: '1px solid #ccc', 
            width: '250px',
            fontSize: '0.9rem' 
          }}
        />
      </div>

      
      {appointmentsList.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          color: '#a0aec0',
          marginTop: '20px'
        }}>
         
          <div style={{ 
            marginBottom: '15px', 
            opacity: 0.6, 
            display: 'flex', 
            justifyContent: 'center',
            fontSize: '64px' 
          }}>
             <CalendarIcon />
          </div>
          <h3 style={{ color: '#4a5568', marginBottom: '8px' }}>No Appointments Found</h3>
          <p style={{ fontSize: '0.95rem' }}>You don't have any appointment requests at the moment.</p>
        </div>
      ) : (
       
        <>
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Date</th><th>Time</th><th>Patient</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {appointmentsList
                .filter(a => {
                  const fullName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Unknown';
                  return fullName.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.patient ? a.patient.firstName + ' ' + a.patient.lastName : 'Unknown'}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: a.status === 'PENDING' ? 'orange' : a.status === 'APPROVED' ? 'green' : 'red' 
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status === 'PENDING' ? (
                        <>
                          <button style={{ ...btnStyle, background: '#28a745' }} onClick={() => handleStatusUpdate(a.id, 'APPROVED')}>Accept</button>
                          <button style={{ ...btnStyle, background: '#dc3545' }} onClick={() => handleStatusUpdate(a.id, 'REJECTED')}>Reject</button>
                        </>
                      ) : <span style={{ fontSize: '0.8rem', color: '#777' }}>Action Taken</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          
          {appointmentsList.filter(a => {
            const fullName = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Unknown';
            return fullName.toLowerCase().includes(searchTerm.toLowerCase());
          }).length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No matching appointments found for "{searchTerm}".</p>
          )}
        </>
      )}
    </div>
  </section>
)}
            {/* --- RECORDS TAB --- */}
{activeTab === 'records' && (
  <section className="doctors-section">
    <div className="action-buttons-container">
      <button className={`action-btn ${recordSubTab === 'view' ? 'active' : ''}`} onClick={() => {setRecordSubTab('view'); resetForms();}}>
        <ListIcon /> View List
      </button>
      <button className={`action-btn ${recordSubTab === 'add' ? 'active' : ''}`} onClick={() => {setRecordSubTab('add'); resetForms();}}>
        <PlusIcon /> Add Record
      </button>
    </div>

    {recordSubTab === 'view' ? (
   
      recordsList.length === 0 ? (
       
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          color: '#a0aec0',
          marginTop: '20px'
        }}>
          <div style={{ 
            marginBottom: '15px', 
            opacity: 0.6, 
            display: 'flex', 
            justifyContent: 'center',
            fontSize: '64px' 
          }}>
             <ListIcon />
          </div>
          <h3 style={{ color: '#4a5568', marginBottom: '8px' }}>No Medical Records Found</h3>
          <p style={{ fontSize: '0.95rem' }}>There are no medical history records to display. Click <strong>"Add Record"</strong> to create a new one.</p>
        </div>
      ) : (
       
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {recordsList.map(r => (
                <tr key={r.id}>
                  <td>{r.recordDate}</td>
                  <td>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'N/A'}</td>
                  <td>{r.diagnosis}</td>
                  <td>
                    <button style={{...btnStyle, background:'#FFC107', color:'black'}} onClick={() => startEditRecord(r)}>Edit</button>
                    <button style={{...btnStyle, background:'#F44336'}} onClick={() => handleDeleteRecord(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    ) : (
      
      <div className="form-container">
        <h3>{isEditing ? 'Edit Medical Record' : 'Add Medical Record'}</h3>
        <form className="admin-form">
          <div className="form-group"><label>Patient ID</label><input type="number" value={newRecord.patientId} onChange={e => setNewRecord({...newRecord, patientId: e.target.value})} /></div>
          <div className="form-group"><label>Doctor ID</label><input type="number" value={newRecord.doctorId} onChange={e => setNewRecord({...newRecord, doctorId: e.target.value})} /></div>
          <div className="form-group"><label>Record Date</label><input type="date" value={newRecord.recordDate} onChange={e => setNewRecord({...newRecord, recordDate: e.target.value})} /></div>
          <div className="form-group"><label>Diagnosis</label><input value={newRecord.diagnosis} onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})} /></div>
          <div className="form-group"><label>Treatment</label><input value={newRecord.treatment} onChange={e => setNewRecord({...newRecord, treatment: e.target.value})} /></div>
          <button type="button" className="save-btn" style={{background:'#2E7D32'}} onClick={handleSaveRecord}>{isEditing ? 'Update Record' : 'Save Record'}</button>
        </form>
      </div>
    )}
  </section>
)}
{/* --- BILLING TAB --- */}
{activeTab === 'billing' && (
  <section className="doctors-section">
    <div className="action-buttons-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
      <button 
        className={`action-btn ${billingSubTab === 'view' ? 'active' : ''}`} 
        onClick={() => { setBillingSubTab('view'); resetForms(); setSearchTerm(''); }}
      >
        <ListIcon /> View History
      </button>
      <button 
        className={`action-btn ${billingSubTab === 'add' ? 'active' : ''}`} 
        onClick={() => { setBillingSubTab('add'); resetForms(); }}
      >
        <PlusIcon /> Create Bill
      </button>

      {billingSubTab === 'view' && (
        <input 
          type="text" 
          placeholder="Search by Bill ID or Status..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            borderRadius: '5px', 
            border: '1px solid #ccc', 
            marginLeft: 'auto', 
            width: '250px' 
          }}
        />
      )}
    </div>

    {billingSubTab === 'view' ? (
     
      billingsList.length === 0 ? (
     
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          color: '#a0aec0',
          marginTop: '20px'
        }}>
          <div style={{ 
            marginBottom: '15px', 
            opacity: 0.6, 
            display: 'flex', 
            justifyContent: 'center',
            fontSize: '64px' 
          }}>
             <ListIcon />
          </div>
          <h3 style={{ color: '#4a5568', marginBottom: '8px' }}>No Billing History</h3>
          <p style={{ fontSize: '0.95rem' }}>It looks like there are no invoices generated yet. Click <strong>"Create Bill"</strong> to start.</p>
        </div>
      ) : (
       
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Bill ID</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {billingsList
                .filter(b => 
                  b.billId.toString().includes(searchTerm) || 
                  b.status.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(b => (
                  <tr key={b.billId}>
                    <td>#{b.billId}</td>
                    <td>Rs. {Number(b.amount).toFixed(2)}</td>
                    <td>
                      <span style={{ 
                        color: b.status === 'PAID' ? '#2e7d32' : '#d32f2f', 
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        background: b.status === 'PAID' ? '#e8f5e9' : '#ffebee',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button style={{ ...btnStyle, background: '#007BFF' }} onClick={() => printBill(b)}>Print</button>
                      <button style={{ ...btnStyle, background: '#FFC107', color: 'black' }} onClick={() => startEditBill(b)}>Edit</button>
                      <button style={{ ...btnStyle, background: '#F44336' }} onClick={() => handleDeleteBill(b.billId)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

        
          {billingsList.filter(b => 
            b.billId.toString().includes(searchTerm) || 
            b.status.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No matching records found for "{searchTerm}".</p>
          )}
        </div>
      )
    ) : (
      
      <div className="form-container">
        <h3>{isEditing ? 'Edit Bill' : 'Create New Bill'}</h3>
        <form className="admin-form">
          <div className="form-group">
            <label>Appointment ID</label>
            <input type="number" value={newBill.appointmentId} onChange={e => setNewBill({ ...newBill, appointmentId: e.target.value })} placeholder="Enter Appointment ID" />
          </div>
          <div className="form-group">
            <label>Amount (Rs.)</label>
            <input type="number" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Payment Status</label>
            <select 
                value={newBill.status} 
                onChange={e => setNewBill({ ...newBill, status: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PENDING">PENDING</option>
            </select>
          </div>
          <button type="button" className="save-btn" onClick={handleSaveBill}>{isEditing ? 'Update Bill' : 'Generate Bill'}</button>
        </form>
      </div>
    )}
  </section>
)}

            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default DoctorDashboard;
