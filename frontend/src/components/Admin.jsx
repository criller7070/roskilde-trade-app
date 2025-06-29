import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Users, Package, AlertTriangle, Shield, Bug, Flag } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { items } = useItems();
  const { 
    isAdmin, 
    adminLoading, 
    adminStats, 
    updateAdminStats
  } = useAdmin();
  
  const [bugReports, setBugReports] = useState([]);
  const [flags, setFlags] = useState([]);

  // Subscribe to bug reports
  useEffect(() => {
    // Don't start listener if admin status is still loading or user is not admin
    if (adminLoading || !user || !isAdmin) return;

    const q = query(collection(db, "bugReports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setBugReports(reportsData);
    }, (error) => {
      console.error("Error fetching bug reports:", error);
    });

    return () => unsubscribe();
  }, [isAdmin, adminLoading, user]);

  // Subscribe to flags
  useEffect(() => {
    // Don't start listener if admin status is still loading or user is not admin
    if (adminLoading || !user || !isAdmin) return;

    const q = query(collection(db, "flags"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flagsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setFlags(flagsData);
    }, (error) => {
      console.error("Error fetching flags:", error);
    });

    return () => unsubscribe();
  }, [isAdmin, adminLoading, user]);

  useEffect(() => {
    if (isAdmin) {
      // Calculate and update admin stats
      const newStats = {
        totalItems: items.length,
        totalUsers: new Set(items.map(item => item.userId)).size,
        recentItems: items.filter(item => {
          // Handle both createdAt and timestamp field names (createdAt is primary)
          const itemDate = item.createdAt?.toDate?.() || 
                          new Date(item.createdAt) || 
                          item.timestamp?.toDate?.() || 
                          new Date(item.timestamp) || 
                          new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          return itemDate >= today;
        }).length,
        flaggedItems: items.filter(item => item.flagged).length || 0,
        bugReports: bugReports.length,
        openBugReports: bugReports.filter(report => report.status === "open").length,
        flags: flags.length,
        openFlags: flags.filter(flag => flag.status === "open").length
      };
      updateAdminStats(newStats);
    }
  }, [items, isAdmin, bugReports, flags, updateAdminStats]);

  if (adminLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Indlæser administratorpanel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Adgang Nægtet</h2>
          <p className="text-gray-600">Log venligst ind for at få adgang til administratorpanelet.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Adgang Nægtet</h2>
          <p className="text-gray-600">Du har ikke tilladelse til at få adgang til administratorpanelet.</p>
          <p className="text-sm text-gray-500 mt-2">Kontakt en administrator, hvis du mener, dette er en fejl.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrator Dashboard</h1>
            <p className="text-gray-600">Velkommen, {user.displayName} ({user.email})</p>
          </div>
          <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
            <Shield className="text-orange-600" size={20} />
            <span className="text-orange-800 font-medium">Administrator</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Samlede Opslag</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Aktive Brugere</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="text-orange-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Nye Opslag (i dag)</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.recentItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Flagede Opslag</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.flaggedItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Bug className="text-purple-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Fejlrapporter</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.bugReports || 0}</p>
              <p className="text-xs text-purple-600">{adminStats.openBugReports || 0} åben</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Flag className="text-red-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Flag Rapporter</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.flags || 0}</p>
              <p className="text-xs text-red-600">{adminStats.openFlags || 0} åben</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Package className="text-blue-500 mr-3" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Administrer Opslag</h3>
              <p className="text-sm text-gray-600">Fjern upassende eller udløbne opslag</p>
            </div>
          </div>
          <a 
            href="/admin/posts" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Gå til Opslag →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="text-green-500 mr-3" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Brugerstyring</h3>
              <p className="text-sm text-gray-600">Administrer brugere og tilladelser</p>
            </div>
          </div>
          <a 
            href="/admin/users" 
            className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
          >
            Gå til Brugere →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Bug className="text-purple-500 mr-3" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Fejlrapporter</h3>
              <p className="text-sm text-gray-600">Gennemgå og løs brugerrapporterede problemer</p>
            </div>
          </div>
          <a 
            href="/admin/bug-reports" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
          >
            Gå til Fejlrapporter →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Flag className="text-red-500 mr-3" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Flaggede Opslag</h3>
              <p className="text-sm text-gray-600">Administrer rapporterede og flaggede opslag</p>
            </div>
          </div>
          <a 
            href="/admin/flagged" 
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
          >
            Gå til Flaggede →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Admin; 