// src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.JSX.Element }> = ({ children }) => {
  const auth = useContext(AuthContext);
  if (auth?.loading) return <div>Syncing secure workspace state...</div>;
  return auth?.user ? children : <Navigate to="/login" replace />;
};
