import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerProtectedRoute() {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fffe]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2AB5A5]" />
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
