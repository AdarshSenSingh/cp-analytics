import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: {
          'x-auth-token': token
        }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Login failed'
      };
    }
  };

  const register = async (username, email, password, name) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        name
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

