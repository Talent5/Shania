import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity, User, Droplet, LogOut, History,
  Stethoscope, ArrowRight, Heart, Clock, AlertTriangle,
  CheckCircle, BarChart3, Syringe, Thermometer,
  ShieldAlert, Wind, Gauge, Circle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

function useCounter(end, duration = 1.2) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

function StatCard({ icon: Icon, color, value, label, formatter }) {
  const count = useCounter(value);
  return (
    <motion.div className="stat-card" variants={fadeUp} whileHover={{ y: -2 }}>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <h3>{formatter ? formatter(count) : count}</h3>
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

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

  const highRiskCount = history.filter(h => h.risk_level === 'High').length;
  const lowRiskCount = history.filter(h => h.risk_level === 'Low').length;

  useEffect(() => { fetchHistory(); }, []);

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
      const response = await axios.post(`${API_URL}/predict`, formData, { withCredentials: true });
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
      const response = await axios.get(`${API_URL}/history?limit=5`, { withCredentials: true });
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleLogout = async () => {
    try { await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }); onLogout(); }
    catch (err) { onLogout(); }
  };

  const featureData = [
    { name: 'BNP', value: 0.35 }, { name: 'Age', value: 0.25 },
    { name: 'Creatinine', value: 0.15 }, { name: 'Sys BP', value: 0.10 },
    { name: 'Sodium', value: 0.08 }, { name: 'Heart Rate', value: 0.05 },
  ];

  const initals = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DR';

  const sections = [
    {
      title: 'Demographics', icon: User,
      fields: [
        { label: 'Age', name: 'Age', icon: User, type: 'number', props: { min: 18 } },
        { label: 'Gender', name: 'Gender', type: 'select', options: [['M', 'Male'], ['F', 'Female']] },
        { label: 'Admission', name: 'AdmissionType', type: 'select',
          options: [['EMERGENCY', 'Emergency'], ['URGENT', 'Urgent'], ['ELECTIVE', 'Elective']] },
        { label: 'Insurance', name: 'Insurance', type: 'select',
          options: [['Medicare', 'Medicare'], ['Medicaid', 'Medicaid'], ['Private', 'Private'],
                    ['Government', 'Government'], ['Self Pay', 'Self Pay']] }
      ]
    },
    {
      title: 'Vital Signs', icon: Heart,
      fields: [
        { label: 'Systolic BP', name: 'SystolicBP', icon: Gauge, suffix: 'mmHg' },
        { label: 'Diastolic BP', name: 'DiastolicBP', icon: Gauge, suffix: 'mmHg' },
        { label: 'Heart Rate', name: 'HeartRate', icon: Activity, suffix: 'bpm' },
        { label: 'Resp Rate', name: 'RespRate', icon: Wind, suffix: 'bpm' },
        { label: 'SpO₂', name: 'SpO2', icon: Thermometer, suffix: '%', props: { min: 0, max: 100 } }
      ]
    },
    {
      title: 'Lab Results', icon: Droplet,
      fields: [
        { label: 'BNP', name: 'BNP', icon: Syringe, suffix: 'pg/mL' },
        { label: 'Creatinine', name: 'Creatinine', icon: Syringe, suffix: 'mg/dL', props: { step: 0.1 } },
        { label: 'Sodium', name: 'Sodium', icon: Syringe, suffix: 'mEq/L' },
        { label: 'Hemoglobin', name: 'Hemoglobin', icon: Syringe, suffix: 'g/dL', props: { step: 0.1 } }
      ]
    },
    {
      title: 'Clinical History', icon: Stethoscope,
      fields: [
        { label: 'Diabetes', name: 'Diabetes', type: 'select', options: [[0, 'No'], [1, 'Yes']] },
        { label: 'Hypertension', name: 'Hypertension', type: 'select', options: [[0, 'No'], [1, 'Yes']] },
        { label: 'Atrial Fib.', name: 'AtrialFib', type: 'select', options: [[0, 'No'], [1, 'Yes']] },
        { label: 'COPD', name: 'COPD', type: 'select', options: [[0, 'No'], [1, 'Yes']] }
      ]
    }
  ];

  return (
    <motion.div className="container" initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.header className="dashboard-header" variants={fadeUp}>
        <div className="header-left">
          <motion.div
            className="header-icon"
            whileHover={{ scale: 1.06, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Activity size={26} color="white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h1>ADHF Risk Dashboard</h1>
            <p>30-day readmission prediction for heart failure patients</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <div className="user-avatar">{initals}</div>
            <div className="user-info">
              <span className="name">{user?.full_name}</span>
              <span className="role">{user?.role}</span>
            </div>
          </div>
          <motion.button
            onClick={handleLogout} className="secondary-btn"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            <LogOut size={15} /> Logout
          </motion.button>
        </div>
      </motion.header>

      {/* Stats Bar */}
      <motion.div className="stats-bar" variants={stagger}>
        <StatCard icon={BarChart3} color="blue" value={history.length} label="Total Evaluations" />
        <StatCard icon={AlertTriangle} color="red" value={highRiskCount} label="High Risk Cases" />
        <StatCard icon={CheckCircle} color="green" value={lowRiskCount} label="Low Risk Cases" />
        <StatCard icon={ShieldAlert} color="purple" value={94} label="Model Accuracy %" formatter={(v) => `${v}%`} />
      </motion.div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left: Form */}
        <motion.div className="card dashboard" variants={fadeUp} style={{ marginBottom: 0 }}>
          <h3 className="card-title"><Activity size={18} /> Patient Assessment</h3>
          <form onSubmit={handleSubmit}>
            {sections.map((section) => (
              <motion.div key={section.title} className="form-section" variants={fadeUp}>
                <h4 className="section-title">
                  <section.icon size={16} /> {section.title}
                </h4>
                <div className="form-row">
                  {section.fields.map((field) => (
                    <div className="form-group" key={field.name}>
                      <label>
                        {field.icon ? <field.icon size={13} /> : <Circle size={13} style={{opacity: 0.3}} />}
                        {field.label}{field.suffix ? ` (${field.suffix})` : ''}
                      </label>
                      <div className="input-wrapper">
                        {field.icon && <field.icon size={14} className="input-icon" />}
                        {field.type === 'select' ? (
                          <select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                          >
                            {field.options.map(([val, lbl]) => (
                              <option key={val} value={val}>{lbl}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required
                            {...field.props}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AlertTriangle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="submit-area">
              <motion.button
                type="submit" className="submit-btn" disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
              >
                {loading ? (
                  <motion.span
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-flex' }}
                    >
                      <Activity size={17} />
                    </motion.span>
                    Evaluating...
                  </motion.span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Calculate Risk Score <ArrowRight size={17} />
                  </span>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Right Column */}
        <div className="right-col">
          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                className={`card results-card ${result.prediction === 1 ? 'high-risk' : 'low-risk'}`}
                style={{ marginBottom: 0 }}
              >
                <div className="result-header">
                  {result.prediction === 1
                    ? <AlertTriangle size={22} color="#dc2626" />
                    : <CheckCircle size={22} color="#059669" />
                  }
                  <h2>Risk Assessment</h2>
                </div>

                <motion.div
                  className={`risk-indicator ${result.prediction === 1 ? 'risk-high' : 'risk-low'}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                >
                  {result.prediction === 1 ? <AlertTriangle size={26} /> : <Heart size={26} />}
                  {result.message}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="probability-bar">
                    <motion.div
                      className="probability-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.probability * 100}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{
                        background: result.probability > 0.5
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : 'linear-gradient(90deg, #22c55e, #16a34a)'
                      }}
                    />
                    <span className="probability-label">
                      {(result.probability * 100).toFixed(1)}% Readmission Risk
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="result-meta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="result-meta-item">
                    <span className="label">Patient Age</span>
                    <span className="value">{formData.Age} years</span>
                  </div>
                  <div className="result-meta-item">
                    <span className="label">Gender</span>
                    <span className="value">{formData.Gender === 'M' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="result-meta-item">
                    <span className="label">Admission Type</span>
                    <span className="value" style={{ textTransform: 'capitalize' }}>{formData.AdmissionType.toLowerCase()}</span>
                  </div>
                  <div className="result-meta-item">
                    <span className="label">Primary Feature</span>
                    <span className="value">BNP ({featureData[0].value * 100}%)</span>
                  </div>
                </motion.div>

                <motion.div
                  className="chart-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="chart-title">
                    <BarChart3 size={15} /> Feature Importance
                  </h4>
                  <div style={{ width: '100%', height: 140 }}>
                    <ResponsiveContainer>
                      <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name" type="category"
                          style={{ fontSize: '0.75rem', fontWeight: 500 }}
                          tick={{ fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8, border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '0.82rem'
                          }}
                          formatter={(value) => [`${(value * 100).toFixed(0)}%`, 'Importance']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {featureData.map((e, i) => (
                            <Cell key={i} fill={i < 2 ? '#2563eb' : '#93c5fd'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <motion.div className="history-card" variants={fadeUp}>
            <h3 className="history-card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color="#64748b" /> Recent Evaluations
              </span>
              {history.length > 0 && (
                <span className="history-count">{history.length}</span>
              )}
            </h3>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <History size={28} color="#cbd5e1" />
                  <p>No previous evaluations.<br />Run your first prediction.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {[...history].reverse().map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      className="history-item"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="history-item-top">
                        <span className="history-date">
                          <Clock size={11} />
                          {new Date(item.created_at).toLocaleDateString()} {' '}
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`badge ${item.risk_level === 'High' ? 'badge-high' : 'badge-low'}`}>
                          {(item.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="history-item-bottom">
                        <span className="history-age">Age: {item.patient_age}</span>
                        <div className="history-prob">
                          <span className={`history-dot ${item.risk_level === 'High' ? 'high' : 'low'}`} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 500 }}>
                            {item.risk_level} Risk
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
