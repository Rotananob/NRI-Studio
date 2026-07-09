import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e2e', color: '#fff' }}>
      <img src="/logo.png" alt="NRI Studio Logo" style={{ width: '60px', height: '60px', borderRadius: '10px', marginBottom: '15px', animation: 'pulse 2s infinite' }} />
      <h2>Loading NRI Studio...</h2>
    </div>
  );
};

export default LoadingScreen;
