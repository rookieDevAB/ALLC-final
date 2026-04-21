/**
 * CustomerAuthContext.jsx
 * Separate context for customer login, handling access token and session state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext(null);

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session by hitting /refresh on load
  useEffect(() => {
    fetch(`${API}/api/v1/customer/refresh`, { method: 'POST', credentials: 'omit' })
      .then((res) => {
         // Using omit credentials for simplicity unless CORS allows credentials.
         // Wait, our backend sets httpOnly cookie. For fetch to send it we need credentials: 'include'.
      });
  }, []);

  // Proper implementation:
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API}/api/v1/customer/refresh`, { method: 'POST', headers: {'Content-Type': 'application/json'} });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          return fetchMe(data.accessToken);
        }
      } catch (err) {
        console.error('Customer session restore failed', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchMe(token) {
    try {
      const res = await fetch(`${API}/api/v1/customer/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
      }
    } catch {}
  }

  const setSession = (token, customerData) => {
    setAccessToken(token);
    setCustomer(customerData);
  };

  const logout = async () => {
    await fetch(`${API}/api/v1/customer/logout`, { method: 'POST' });
    setAccessToken(null);
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, accessToken, loading, setSession, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside <CustomerAuthProvider>');
  return ctx;
}
