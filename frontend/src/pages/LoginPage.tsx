import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setGuest = useAuthStore(state => state.setGuest);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/ide');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/ide');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = () => {
    setGuest(true);
    navigate('/ide');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1e1e2e', color: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <img src="/logo.png" alt="NRI Studio Logo" style={{ width: '80px', height: '80px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }} />
        <h1 style={{ margin: 0, fontSize: '24px' }}>Login to NRI Studio</h1>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Login</button>
      </form>
      <p>Or</p>
      <button onClick={handleGoogleLogin} style={{ padding: '10px', width: '300px', cursor: 'pointer', marginBottom: '10px' }}>Sign in with Google</button>
      <button onClick={handleGuestLogin} style={{ padding: '10px', width: '300px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}>Continue as Guest (Local Storage)</button>
      <p>Don't have an account? <a href="/register" style={{ color: '#007acc' }}>Register here</a></p>
    </div>
  );
};

export default LoginPage;
