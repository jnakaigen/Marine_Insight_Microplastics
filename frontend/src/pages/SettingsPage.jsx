import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext'; // 1. Import ThemeContext

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // 2. Get the current theme
  const isDark = theme === 'dark'; // 3. Create boolean for styling

  const [user, setUser] = useState({ username: 'Unknown User', email: 'Not available' });
  const [editName, setEditName] = useState('');
  const [defaultSamplingLocation, setDefaultSamplingLocation] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    // Load Sampling Location
    const storedLocation = window.localStorage.getItem('defaultSamplingLocation') || '';
    setDefaultSamplingLocation(storedLocation);

    // Existing logic to find the user in localStorage
    const parsePossibleUser = () => {
      const candidateKeys = ['user', 'authUser', 'profile', 'currentUser'];
      for (const key of candidateKeys) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch {
          return { email: raw, username: raw };
        }
      }
      const email = window.localStorage.getItem('email');
      const username = window.localStorage.getItem('username');
      if (email || username) return { email, username };
      return null;
    };

    const decodeJwtUser = () => {
      const token = window.localStorage.getItem('token') || window.localStorage.getItem('authToken');
      if (!token) return null;
      const payload = token.split('.')[1];
      if (!payload) return null;
      try {
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded;
      } catch { return null; }
    };

    const storedUser = parsePossibleUser();
    const tokenUser = decodeJwtUser();
    const effectiveUser = storedUser || tokenUser;

    if (effectiveUser) {
      const currentUsername = effectiveUser.username || effectiveUser.name || effectiveUser.preferred_username || effectiveUser.email?.split('@')[0] || 'Unknown User';
      const currentEmail = effectiveUser.email || effectiveUser.username || 'Not available';
      
      setUser({ username: currentUsername, email: currentEmail });
      setEditName(currentUsername); 
    }
  }, []);

  const handleUpdateProfile = () => {
    const updatedUser = { ...user, username: editName };
    setUser(updatedUser);
    
    window.localStorage.setItem('user', JSON.stringify(updatedUser));
    window.localStorage.setItem('username', editName);
    
    setProfileMessage('Profile Updated!');
    window.setTimeout(() => setProfileMessage(''), 2000);
  };

  const handleSavePreferences = () => {
    window.localStorage.setItem('defaultSamplingLocation', defaultSamplingLocation.trim());
    setLocationMessage('Location Saved!');
    window.setTimeout(() => setLocationMessage(''), 1800);
  };

  const handleLogout = () => {
    const keysToRemove = ['token', 'authToken', 'user', 'authUser', 'profile', 'email', 'username'];
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
    navigate('/login');
  };

  // --- DYNAMIC STYLES BASED ON isDark ---
  const pageStyles = { 
    minHeight: '100vh', 
    padding: '32px', 
    backgroundColor: isDark ? '#0b1117' : '#f4f7f6', 
    color: isDark ? '#e3e8ee' : '#1f2937', 
    fontFamily: 'Inter, sans-serif',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };
  
  const cardStyles = { 
    backgroundColor: isDark ? '#111820' : '#ffffff', 
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.08)'}`, 
    borderRadius: '18px', 
    padding: '28px', 
    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.35)' : '0 24px 60px rgba(15, 23, 42, 0.08)', 
    marginBottom: '24px',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  };
  
  const sectionTitleStyles = { 
    fontSize: '1.1rem', 
    margin: '0 0 24px', 
    color: isDark ? '#94a3b8' : '#4b5563', 
    textTransform: 'uppercase', 
    fontWeight: 700 
  };
  
  const inputStyles = { 
    width: '100%', 
    borderRadius: '12px', 
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15, 23, 42, 0.12)'}`, 
    padding: '12px 16px', 
    fontSize: '1rem', 
    marginTop: '8px', 
    marginBottom: '16px', 
    outline: 'none',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937'
  };
  
  const primaryButton = { 
    backgroundColor: '#007bff', 
    color: '#ffffff', 
    borderRadius: '999px', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '0.8rem 1.5rem', 
    fontWeight: 700, 
    transition: 'all 0.2s' 
  };
  
  const readOnlyStyles = { 
    ...inputStyles, 
    backgroundColor: isDark ? '#0f1720' : '#f9fafb', 
    color: isDark ? '#64748b' : '#6b7280', 
    cursor: 'not-allowed' 
  };

  const labelStyles = { 
    fontWeight: 600, 
    color: isDark ? '#e3e8ee' : '#1f2937' 
  };

  return (
    <Layout>
      <div style={pageStyles}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', color: isDark ? '#ffffff' : '#1f2937' }}>Settings</h1>
          <p style={{ color: isDark ? '#94a3b8' : '#4b5563', marginBottom: '32px' }}>Update your profile and local preferences.</p>

          {/* ACCOUNT DETAILS FORM */}
          <section style={cardStyles}>
            <p style={sectionTitleStyles}>Account Details</p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyles}>Username</label>
              <input 
                style={inputStyles}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyles}>Email</label>
              <input 
                style={readOnlyStyles}
                value={user.email}
                readOnly
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={handleUpdateProfile} style={primaryButton}>Update Name</button>
              {profileMessage && <span style={{ color: '#10b981', fontWeight: 600 }}>{profileMessage}</span>}
            </div>
          </section>

          {/* LOCAL PREFERENCES */}
          <section style={cardStyles}>
            <p style={sectionTitleStyles}>Local Preferences</p>
            <label style={labelStyles}>Default Sampling Location</label>
            <input
              style={inputStyles}
              value={defaultSamplingLocation}
              onChange={(e) => setDefaultSamplingLocation(e.target.value)}
              placeholder="Enter your preferred sampling location"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={handleSavePreferences} style={primaryButton}>Save Location</button>
              {locationMessage && <span style={{ color: '#10b981', fontWeight: 600 }}>{locationMessage}</span>}
            </div>
          </section>

          {/* LOGOUT */}
          <section style={cardStyles}>
            <p style={sectionTitleStyles}>Session</p>
            <button onClick={handleLogout} style={{ ...primaryButton, backgroundColor: '#ef4444' }}>Log Out</button>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;