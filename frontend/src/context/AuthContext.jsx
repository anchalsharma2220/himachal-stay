import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('pg_token'));

  const logout = useCallback(() => { localStorage.removeItem('pg_token'); setUser(null); }, []);

  useEffect(() => {
    const token = localStorage.getItem('pg_token');
    if (token) {
      api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('pg_token')).finally(() => setLoading(false));
    }
    window.addEventListener('pg-logout', logout);
    return () => window.removeEventListener('pg-logout', logout);
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pg_token', data.token); setUser(data.user); return data.user;
  };
  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('pg_token', data.token); setUser(data.user); return data.user;
  };

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
