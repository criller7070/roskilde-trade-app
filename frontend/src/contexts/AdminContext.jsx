import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

// List of approved admin emails
const ADMIN_EMAILS = [
  "philippzhuravlev@gmail.com",
  "crillerhylle@gmail.com"
];

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalItems: 0,
    totalUsers: 0,
    recentItems: 0,
    flaggedItems: 0
  });

  // Check if user is admin (client-side only)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    const isAdminUser = ADMIN_EMAILS.includes(user.email);
    setIsAdmin(isAdminUser);
    setAdminLoading(false);
  }, [user]);

  // Update admin stats
  const updateAdminStats = useCallback((newStats) => {
    setAdminStats(prev => ({ ...prev, ...newStats }));
  }, []);

  // Simple action logging (console only)
  const logAdminAction = useCallback(async (action, details = {}) => {
    if (!isAdmin) return;
    console.log('Admin Action:', action, details);
  }, [isAdmin]);

  const value = {
    // State
    isAdmin,
    adminLoading,
    adminStats,
    
    // Functions
    updateAdminStats,
    logAdminAction
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
} 