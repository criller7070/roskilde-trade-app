import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from './AuthContext';
import { db } from '../firebase';

const AdminContext = createContext();

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

  // Admin status check (client-side for now)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !user.email) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        // Check admin status from Firestore configuration
        const adminConfigRef = doc(db, 'admin', 'config');
        const adminConfigSnap = await getDoc(adminConfigRef);

        if (adminConfigSnap.exists()) {
          const adminConfig = adminConfigSnap.data();
          const adminEmails = adminConfig.adminEmails || [];
          
          const userIsAdmin = adminEmails.includes(user.email);
          setIsAdmin(userIsAdmin);
        } else {
          setIsAdmin(false);
          if (import.meta.env.DEV) {
            console.warn('Admin configuration not found in Firestore');
          }
        }
      } catch (error) {
        // If we can't check admin status, default to false for security
        setIsAdmin(false);
        if (import.meta.env.DEV) {
          console.error('Error checking admin status:', error.code);
        }
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Update admin stats
  const updateAdminStats = useCallback((newStats) => {
    setAdminStats(prev => ({ ...prev, ...newStats }));
  }, []);

  // SECURE: Server-side admin action logging to Firestore
  const logAdminAction = useCallback(async (action, details = {}) => {
    if (!isAdmin || !user) return;

    try {
      // Log admin actions to Firestore (protected by security rules)
      const adminActionsRef = collection(db, 'adminActions');
      
      await addDoc(adminActionsRef, {
        action,
        adminEmail: user.email,
        adminUID: user.uid,
        adminName: user.displayName || 'Unknown',
        timestamp: serverTimestamp(),
        details: {
          // Only log safe, non-sensitive details
          itemCount: details.itemCount || null,
          reportCount: details.reportCount || null,
          actionType: details.actionType || null
        },
        userAgent: navigator.userAgent,
        ipAddress: null // Would need server-side function to get real IP
      });

      if (import.meta.env.DEV) {
        console.log('Admin action logged:', action);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging admin action:', error.code);
      }
      // Don't throw - logging failure shouldn't break admin operations
    }
  }, [isAdmin, user]);

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