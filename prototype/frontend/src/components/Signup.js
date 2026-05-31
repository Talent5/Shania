import React, { useState } from 'react';
import axios from 'axios';
import {
  User, Mail, Lock, AlertCircle, UserPlus, Eye, EyeOff,
  Check, X, Activity, Heart, TrendingUp, Shield, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } }
};

const floatingIcons = [
  { Icon: Heart, style: { top: '10%', left: '10%', animationDelay: '0s' } },
  { Icon: TrendingUp, style: { top: '60%', left: '15%', animationDelay: '-5s' } },
  { Icon: Stethoscope, style: { top: '20%', right: '15%', animationDelay: '-10s' } },
  { Icon: Shield, style: { bottom: '20%', right: '10%', animationDelay: '-15s' } },
  { Icon: Activity, style: { top: '45%', right: '25%', animationDelay: '-7s' } },
];

function Signup({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'clinician'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = getStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#059669'];
  const strengthClasses = ['weak', 'fair', 'good', 'strong', 'very-strong'];
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        fullName: formData.fullName, email: formData.email,
        password: formData.password, role: formData.role
      }, { withCredentials: true });

      if (response.data.success) {
        alert('Account created successfully! Please login.');
        onSwitchToLogin();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Activity size={36} color="white" />
          </motion.div>
          <h2>Join the Future of<br />Heart Failure Care</h2>
          <p>
            Create your account to start leveraging AI-powered risk predictions for better patient outcomes and reduced hospital readmissions.
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
            <h1>Create your account</h1>
            <p>Join healthcare professionals using data-driven insights for better clinical decisions.</p>
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
              <label><User size={14} /> Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text" name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>
            </motion.div>

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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button" className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    className="pw-strength"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="pw-strength-bars">
                      {[0,1,2,3,4].map((s) => (
                        <div
                          key={s}
                          className={`pw-strength-bar ${s < strength ? `active ${strengthClasses[strength - 1]}` : ''}`}
                        />
                      ))}
                    </div>
                    <span className="pw-strength-label" style={{ color: strengthColors[strength - 1] || 'var(--slate-400)' }}>
                      {strengthLabels[strength - 1] || ''}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="form-group" variants={fadeUp}>
              <label><Lock size={14} /> Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password" name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                />
                <span className="pw-match-icon">
                  {formData.confirmPassword && (
                    passwordsMatch
                      ? <Check size={16} color="#059669" />
                      : <X size={16} color="#dc2626" />
                  )}
                </span>
              </div>
            </motion.div>

            <motion.div className="form-group" variants={fadeUp}>
              <label><User size={14} /> Role</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="clinician">Clinician</option>
                  <option value="nurse">Nurse</option>
                  <option value="researcher">Researcher</option>
                  <option value="administrator">Administrator</option>
                </select>
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
                    Creating Account...
                  </motion.span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserPlus size={18} /> Create Account
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p>Already have an account?</p>
            <motion.button
              onClick={onSwitchToLogin}
              className="link-btn"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Sign in
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Signup;
