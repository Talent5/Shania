import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, AlertCircle, LogIn, Activity, Heart, TrendingUp, Shield, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../auth';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
};

const floatingIcons = [
  { Icon: Heart, style: { top: '10%', left: '10%', animationDelay: '0s' } },
  { Icon: TrendingUp, style: { top: '60%', left: '15%', animationDelay: '-5s' } },
  { Icon: Stethoscope, style: { top: '20%', right: '15%', animationDelay: '-10s' } },
  { Icon: Shield, style: { bottom: '20%', right: '10%', animationDelay: '-15s' } },
  { Icon: Activity, style: { top: '45%', right: '25%', animationDelay: '-7s' } },
];

function Login({ onSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, { withCredentials: true });
      if (response.data.user) onSuccess(response.data.user, response.data.auth_token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-split"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Brand Panel */}
      <div className="auth-brand">
        {floatingIcons.map(({ Icon, style }, i) => (
          <div key={i} className="floating-icon" style={style}>
            <Icon size={48} color="white" />
          </div>
        ))}
        <motion.div
          className="auth-brand-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="auth-brand-logo"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Activity size={36} color="white" />
          </motion.div>
          <h2>ADHF Readmission<br />Prediction Platform</h2>
          <p>
            Evidence-based machine learning model for predicting 30-day hospital readmission risk in patients with Acute Decompensated Heart Failure.
          </p>
          <div className="brand-stats">
            <div className="brand-stat">
              <h3>94%</h3>
              <span>Accuracy</span>
            </div>
            <div className="brand-stat">
              <h3>17</h3>
              <span>Clinical Features</span>
            </div>
            <div className="brand-stat">
              <h3>Real-time</h3>
              <span>Predictions</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Auth Panel */}
      <div className="auth-panel">
        <motion.div
          className="auth-panel-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <motion.div
            className="auth-panel-header"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <h1>Welcome back</h1>
            <p>Sign in to access your clinical dashboard and run patient risk assessments.</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-alert"
                  initial={{ opacity: 0, height: 0, margin: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '0.5rem' }}
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="form-group" variants={fadeUp}>
              <label><Mail size={14} /> Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email" name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div className="form-group" variants={fadeUp}>
              <label><Lock size={14} /> Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password" name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <motion.button
                type="submit" className="auth-btn" disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Signing in...
                  </motion.span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LogIn size={18} /> Sign In
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>Don't have an account?</p>
            <motion.button
              onClick={onSwitchToSignup}
              className="link-btn"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Create an account
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Login;
