import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
        const decoded = jwtDecode(token);
        if (decoded?.user?.id) {
            setUser({ id: decoded.user.id, isAdmin: decoded.user.isAdmin, token });
        } else {
            console.warn('Invalid token payload', decoded);
            localStorage.removeItem('token');
        }
        } catch (err) {
        console.error('Failed to decode token', err);
        localStorage.removeItem('token');
        }
    }
    }, []);


    const login = (token) => {
    localStorage.setItem('token', token);
    try {
        const decoded = jwtDecode(token);
        if (decoded?.user?.id) {
        setUser({ id: decoded.user.id, isAdmin: decoded.user.isAdmin, token });
        } else {
        console.warn('Invalid token payload', decoded);
        localStorage.removeItem('token');
        }
    } catch (err) {
        console.error('Failed to decode token', err);
        localStorage.removeItem('token');
    }
    };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}