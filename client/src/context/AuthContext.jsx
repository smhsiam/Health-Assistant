import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const readUser = () => {
  try {
    const saved =
      localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);

  const saveSession = (data, remember) => {
    clearSession();
    const store = remember ? localStorage : sessionStorage;
    store.setItem('token', data.token);
    store.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password, remember) => {
    const response = await api.post('/auth/login', { email, password });
    saveSession(response.data, remember);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    saveSession(response.data, true);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);