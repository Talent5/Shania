import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Signup({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'clinician'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
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
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus size={48} color="#2563eb" />
          <h1>Create Account</h1>
          <p>Join the ADHF Prediction Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label><User size={16} /> Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              required
            />
          </div>

          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@hospital.com"
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label><Lock size={16} /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label><User size={16} /> Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="clinician">Clinician</option>
              <option value="nurse">Nurse</option>
              <option value="researcher">Researcher</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button onClick={onSwitchToLogin} className="link-btn">
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
