import React from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const IDEPage: React.FC = () => {
  const { user, setFirebaseUser, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    setFirebaseUser(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e2e', color: '#fff' }}>
      <header style={{ padding: '10px 20px', backgroundColor: '#252526', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>NRI Studio IDE</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Welcome, {user?.displayName || user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>Editor Area Coming Soon...</h1>
      </div>
    </div>
  );
};

export default IDEPage;
