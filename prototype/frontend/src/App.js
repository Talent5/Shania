import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'signup', 'dashboard'
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      if (response.data.user) {
        setUser(response.data.user);
        setView('dashboard');
      }
    } catch (err) {
      // Not authenticated, stay on login/signup
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {view === 'login' && (
        <Login 
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setView('signup')}
        />
      )}
      
      {view === 'signup' && (
        <Signup 
          onSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setView('login')}
        />
      )}
      
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
