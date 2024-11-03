// src/components/Auth.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { state } = useAuth();

  if (state.isAuthenticating) return <div>Authenticating...</div>;
  if (state.error) return <div>Error: {state.error}</div>;
  if (state.token) return <div>Authenticated!</div>;

  return null;
};

export default Auth;
