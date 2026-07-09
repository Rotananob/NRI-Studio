import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e2e', color: '#fff' }}>
      <h2>Loading NRI Studio...</h2>
    </div>
  );
};

export default LoadingScreen;
