import React from 'react';
import './UserProfile.css';

function UserProfile({ userInfo, onLogout }) {
  if (!userInfo) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-info">
        <p><strong>Username:</strong> {userInfo.preferred_username}</p>
        <p><strong>Name:</strong> {userInfo.given_name} {userInfo.family_name}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Roles:</strong> {userInfo.roles && userInfo.roles.join(', ')}</p>
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserProfile;
