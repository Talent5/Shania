import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Heart, AlertCircle, TrendingUp, User, Droplet, LogOut, History, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ user, onLogout }) {
  const [formData, setFormData] = useState({
    Age: 65,
    Gender: 'M',
    SystolicBP: 120,
    DiastolicBP: 80,
    HeartRate: 80,
    RespRate: 18,
    SpO2: 96,
    BNP: 500,
    Creatinine: 1.2,
    Sodium: 138,
    Hemoglobin: 12,
    Diabetes: 0,
    Hypertension: 1,
    AtrialFib: 0,
    COPD: 0,
    Ethnicity: 'WHITE',
    AdmissionType: 'EMERGENCY',
    Insurance: 'Medicare'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
      const response = await axios.get(`${API_URL}/history?limit=10`, {
        withCredentials: true
      });
      setHistory(response.data.history);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout(); // Logout anyway
    }
  };

  const featureImportanceData = [
    { name: 'BNP', value: 0.35 },
    { name: 'Age', value: 0.25 },
    { name: 'Creatinine', value: 0.15 },
    { name: 'Sys BP', value: 0.10 },
    { name: 'Sodium', value: 0.08 },
    { name: 'Heart Rate', value: 0.05 },
    { name: 'Comorbidities', value: 0.02 },
  ];

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Activity color="#2563eb" size={32} />
            ADHF Readmission Predictor
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0' }}>
            Predicting 30-day hospital readmission risk for heart failure patients
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{user.full_name}</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{user.role}</p>
          </div>
          <button onClick={fetchHistory} className="secondary-btn" title="View History">
            <History size={18} />
          </button>
          <button onClick={handleLogout} className="secondary-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {showHistory && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2><Clock size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Recent Predictions</h2>
            <button onClick={() => setShowHistory(false)} className="link-btn">Close</button>
          </div>
          {history.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No prediction history yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Age</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Risk Level</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(item.created_at).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem' }}>{item.patient_age}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${item.risk_level === 'High' ? 'badge-high' : 'badge-low'}`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{(item.probability * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          Patient Vitals & Demographics
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label><User size={16} /> Age (years)</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="18" required />
            </div>

            <div className="form-group">
              <label><User size={16} /> Gender</label>
              <select name="Gender" value={formData.Gender} onChange={handleChange}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label><Activity size={16} /> Heart Rate (bpm)</label>
              <input type="number" name="HeartRate" value={formData.HeartRate} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><Activity size={16} /> Systolic BP (mmHg)</label>
              <input type="number" name="SystolicBP" value={formData.SystolicBP} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><Activity size={16} /> Diastolic BP (mmHg)</label>
              <input type="number" name="DiastolicBP" value={formData.DiastolicBP} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><Activity size={16} /> Respiratory Rate (bpm)</label>
              <input type="number" name="RespRate" value={formData.RespRate} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><Activity size={16} /> SpO2 (%)</label>
              <input type="number" name="SpO2" value={formData.SpO2} onChange={handleChange} min="0" max="100" required />
            </div>

            <div className="form-group">
              <label><Heart size={16} /> BNP Level (pg/mL)</label>
              <input type="number" name="BNP" value={formData.BNP} onChange={handleChange} required />
              <small style={{color: '#94a3b8'}}>Key indicator for heart failure.</small>
            </div>

            <div className="form-group">
              <label><Droplet size={16} /> Serum Creatinine (mg/dL)</label>
              <input type="number" step="0.1" name="Creatinine" value={formData.Creatinine} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label><Droplet size={16} /> Sodium (mEq/L)</label>
              <input type="number" name="Sodium" value={formData.Sodium} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><Droplet size={16} /> Hemoglobin (g/dL)</label>
              <input type="number" step="0.1" name="Hemoglobin" value={formData.Hemoglobin} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><AlertCircle size={16} /> Diabetes</label>
              <select name="Diabetes" value={formData.Diabetes} onChange={handleChange}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label><AlertCircle size={16} /> Hypertension</label>
              <select name="Hypertension" value={formData.Hypertension} onChange={handleChange}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label><AlertCircle size={16} /> Atrial Fibrillation</label>
              <select name="AtrialFib" value={formData.AtrialFib} onChange={handleChange}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label><AlertCircle size={16} /> COPD</label>
              <select name="COPD" value={formData.COPD} onChange={handleChange}>
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label><User size={16} /> Ethnicity</label>
              <select name="Ethnicity" value={formData.Ethnicity} onChange={handleChange}>
                <option value="WHITE">White</option>
                <option value="BLACK">Black</option>
                <option value="HISPANIC">Hispanic</option>
                <option value="ASIAN">Asian</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label><Activity size={16} /> Admission Type</label>
              <select name="AdmissionType" value={formData.AdmissionType} onChange={handleChange}>
                <option value="EMERGENCY">Emergency</option>
                <option value="URGENT">Urgent</option>
                <option value="ELECTIVE">Elective</option>
              </select>
            </div>

            <div className="form-group">
              <label><User size={16} /> Insurance</label>
              <select name="Insurance" value={formData.Insurance} onChange={handleChange}>
                <option value="Medicare">Medicare</option>
                <option value="Medicaid">Medicaid</option>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Self Pay">Self Pay</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Analyzing...' : 'Predict Re-admission Risk'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card result-container">
          <h2 style={{ marginBottom: '1rem' }}>Prediction Results</h2>
          
          <div className={`risk-indicator ${result.prediction === 1 ? 'risk-high' : 'risk-low'}`}>
            {result.message}
          </div>

          <div className="visualization-grid">
            <div>
              <h3><TrendingUp size={20} style={{verticalAlign: 'middle', marginRight: '8px'}}/> Risk Probability</h3>
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '300px', backgroundColor: '#e2e8f0', borderRadius: '15px', height: '30px', position: 'relative', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${result.probability * 100}%`, 
                      backgroundColor: result.probability > 0.5 ? '#ef4444' : '#22c55e', 
                      height: '100%',
                      transition: 'width 1s ease-in-out'
                    }} 
                  />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#1e293b' }}>
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p style={{textAlign: 'center', color: '#64748b', marginTop: '1rem'}}>
                The model estimates a <strong>{(result.probability * 100).toFixed(1)}%</strong> probability of readmission within 30 days.
              </p>
            </div>

            <div>
              <h3><Activity size={20} style={{verticalAlign: 'middle', marginRight: '8px'}}/> Feature Importance (Global)</h3>
              <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem'}}>
                Top factors contributing to the model's decision-making process.
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={featureImportanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {featureImportanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
