import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored admin token
    const storedToken = localStorage.getItem('admin-token');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAdminAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('https://blocktekradio-v1.onrender.com/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        setAdminToken(result.token);
        setIsAdminAuthenticated(true);
        localStorage.setItem('admin-token', result.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('https://blocktekradio-v1.onrender.com/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdminToken(null);
      setIsAdminAuthenticated(false);
      localStorage.removeItem('admin-token');
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      adminToken,
      loginAdmin,
      logoutAdmin,
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
