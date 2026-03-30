import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity, AlertCircle, TrendingUp, User,
  Droplet, LogOut, History, Stethoscope,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ user, onLogout }) {
  const [formData, setFormData] = useState({
    Age: 65, Gender: 'M', AdmissionType: 'EMERGENCY', Insurance: 'Medicare',
    SystolicBP: 120, DiastolicBP: 80, HeartRate: 80, RespRate: 18, SpO2: 96,
    BNP: 500, Creatinine: 1.2, Sodium: 138, Hemoglobin: 12,
    Diabetes: 0, Hypertension: 1, AtrialFib: 0, COPD: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData, {
        withCredentials: true
      });
      setResult(response.data);
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch prediction.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history?limit=5`, {
        withCredentials: true
      });
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      onLogout();
    } catch (err) {
      onLogout();
    }
  };

  const featureImportanceData = [
    { name: 'BNP', value: 0.35 },
    { name: 'Age', value: 0.25 },
    { name: 'Creatinine', value: 0.15 },
    { name: 'Sys BP', value: 0.10 },
    { name: 'Sodium', value: 0.08 },
    { name: 'Heart Rate', value: 0.05 },
  ];

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title-container">
          <div className="icon-wrapper">
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1>ADHF Risk Dashboard</h1>
            <p>Predicting 30-day hospital readmission risk for heart failure patients</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="user-profile">
            <p className="name">{user.full_name}</p>
            <p className="role">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="secondary-btn" title="Logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Input Form */}
        <div className="card" style={{ marginBottom: 0 }}>
          <form onSubmit={handleSubmit}>
            {/* Section 1: Demographics */}
            <div className="form-section">
              <h3 className="section-title"><User size={20}/> Demographics & Admission</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Age (years)</label>
                  <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="18" required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="Gender" value={formData.Gender} onChange={handleChange}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Admission Type</label>
                  <select name="AdmissionType" value={formData.AdmissionType} onChange={handleChange}>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="URGENT">Urgent</option>
                    <option value="ELECTIVE">Elective</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Insurance</label>
                  <select name="Insurance" value={formData.Insurance} onChange={handleChange}>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Self Pay">Self Pay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Vitals */}
            <div className="form-section">
              <h3 className="section-title"><Activity size={20}/> Vital Signs</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Systolic BP (mmHg)</label>
                  <input type="number" name="SystolicBP" value={formData.SystolicBP} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Diastolic BP (mmHg)</label>
                  <input type="number" name="DiastolicBP" value={formData.DiastolicBP} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Heart Rate (bpm)</label>
                  <input type="number" name="HeartRate" value={formData.HeartRate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Resp Rate (bpm)</label>
                  <input type="number" name="RespRate" value={formData.RespRate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>SpO2 (%)</label>
                  <input type="number" name="SpO2" value={formData.SpO2} onChange={handleChange} min="0" max="100" required />
                </div>
              </div>
            </div>

            {/* Section 3: Labs */}
            <div className="form-section">
              <h3 className="section-title"><Droplet size={20}/> Laboratory Results</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>BNP (pg/mL)</label>
                  <input type="number" name="BNP" value={formData.BNP} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Creatinine (mg/dL)</label>
                  <input type="number" step="0.1" name="Creatinine" value={formData.Creatinine} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Sodium (mEq/L)</label>
                  <input type="number" name="Sodium" value={formData.Sodium} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Hemoglobin (g/dL)</label>
                  <input type="number" step="0.1" name="Hemoglobin" value={formData.Hemoglobin} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Section 4: Comorbidities */}
            <div className="form-section">
              <h3 className="section-title"><Stethoscope size={20}/> Clinical History</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Diabetes</label>
                  <select name="Diabetes" value={formData.Diabetes} onChange={handleChange}>
                    <option value={0}>No</option><option value={1}>Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hypertension</label>
                  <select name="Hypertension" value={formData.Hypertension} onChange={handleChange}>
                    <option value={0}>No</option><option value={1}>Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Atrial Fibrillation</label>
                  <select name="AtrialFib" value={formData.AtrialFib} onChange={handleChange}>
                    <option value={0}>No</option><option value={1}>Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>COPD</label>
                  <select name="COPD" value={formData.COPD} onChange={handleChange}>
                    <option value={0}>No</option><option value={1}>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <AlertCircle size={16} style={{display:'inline', marginRight:'8px', verticalAlign:'middle'}}/>
                {error}
              </div>
            )}

            <div className="submit-container">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Evaluating Model...' : <><i> Calculate Risk Score  <ArrowRight size={18}/></i></>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Output & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Prediction Result Block */}
          {result && (
            <div className={`card results-card ${result.prediction === 1 ? 'high-risk' : 'low-risk'}`} style={{ marginBottom: 0 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0' }}>
                <TrendingUp size={24} color={result.prediction === 1 ? '#ef4444' : '#22c55e'} />
                Risk Assessment
              </h2>
              
              <div className={`risk-indicator ${result.prediction === 1 ? 'risk-high' : 'risk-low'}`} style={{fontSize: '1.4rem'}}>
                {result.message}
              </div>

              <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#e2e8f0', borderRadius: '20px', height: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${result.probability * 100}%`, 
                      backgroundColor: result.probability > 0.5 ? '#ef4444' : '#22c55e', 
                      height: '100%',
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>
                    Risk Probability: {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Global Feature Importance</h4>
                <div style={{ width: '100%', height: '160px', marginTop: '1rem' }}>
                  <ResponsiveContainer>
                    <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" style={{fontSize: '0.8rem'}} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {featureImportanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index < 2 ? '#2563eb' : '#93c5fd'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* History Sidebar */}
          <div className="history-sidebar">
            <h2 className="history-header">
              <History size={20} color="#64748b" /> Recent Evaluations
            </h2>
            <div className="history-list">
              {history.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No previous evaluations.</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="history-card">
                    <div className="history-meta">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="history-body">
                      <span className="history-patient">Age: {item.patient_age}</span>
                      <span className={`badge ${item.risk_level === 'High' ? 'badge-high' : 'badge-low'}`} style={{fontSize: '0.75rem'}}>
                        {(item.probability * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
