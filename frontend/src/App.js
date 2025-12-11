import React, { useState, useEffect } from 'react';
import keycloak from './keycloak';
import apiService from './services/apiService';
import UserProfile from './components/UserProfile';
import CourseList from './components/CourseList';
import CourseManagement from './components/CourseManagement';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    initKeycloak();
  }, []);

  const initKeycloak = async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false
      });
      
      if (authenticated) {
        setAuthenticated(true);
        apiService.setKeycloak(keycloak);
        
        // Fetch user info from backend
        const userInfoData = await apiService.getUserInfo();
        setUserInfo(userInfoData);
        
        // Setup token refresh
        setupTokenRefresh();
      }
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupTokenRefresh = () => {
    setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        keycloak.login();
      });
    }, 60000); // Check every minute
  };

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
  };

  const isAdmin = () => {
    return userInfo && userInfo.roles && userInfo.roles.includes('ADMIN');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading E-Learning Platform...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="loading-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>E-Learning Platform</h1>
        <p className="subtitle">Secured with OAuth2 / OpenID Connect</p>
      </header>

      <div className="container">
        <UserProfile userInfo={userInfo} onLogout={handleLogout} />

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Available Courses
          </button>
          {isAdmin() && (
            <button
              className={`tab ${activeTab === 'management' ? 'active' : ''}`}
              onClick={() => setActiveTab('management')}
            >
              Course Management
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'courses' && <CourseList />}
          {activeTab === 'management' && <CourseManagement isAdmin={isAdmin()} />}
        </div>
      </div>

      <footer className="app-footer">
        <p>&copy; 2024 E-Learning Platform - TP3 OAuth2/OIDC Project</p>
      </footer>
    </div>
  );
}

export default App;
