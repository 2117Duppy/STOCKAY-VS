
import React from 'react';
import LandingPage from '@/components/LandingPage';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      {isAuthenticated ? <Dashboard /> : <LandingPage />}
    </>
  );
};

export default Index;
