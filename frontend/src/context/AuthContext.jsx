import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('guest');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('guest') === 'true';

    if (isGuest) {
      setUser({ guest: true, displayName: 'Guest', username: 'guest' });
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
  }, [logout]);

  const login = (token) => {
    localStorage.setItem('token', token);
    localStorage.removeItem('guest');
    setLoading(true);
    api.get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  };

  const loginAsGuest = () => {
    localStorage.setItem('guest', 'true');
    localStorage.removeItem('token');
    setUser({ guest: true, displayName: 'Guest', username: 'guest' });
  };

  const isAuthenticated = !!user && !user.guest;
  const isGuest = !!user?.guest;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isGuest, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
