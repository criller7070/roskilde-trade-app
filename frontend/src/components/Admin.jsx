import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, Users, Package, AlertTriangle, Shield, Bug, Eye, CheckCircle } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Admin = () => {
  const { user } = useAuth();
  const { items, removeItem } = useItems();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { 
    isAdmin, 
    adminLoading, 
    adminStats, 
    logAdminAction,
    updateAdminStats
  } = useAdmin();
  
  const [bugReports, setBugReports] = useState([]);
  const [bugReportsLoading, setBugReportsLoading] = useState(true);

  // Subscribe to bug reports
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "bugReports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setBugReports(reportsData);
      setBugReportsLoading(false);
    }, (error) => {
      console.error("Error fetching bug reports:", error);
      setBugReportsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

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
        openBugReports: bugReports.filter(report => report.status === "open").length
      };
      updateAdminStats(newStats);
    }
  }, [items, isAdmin, bugReports]);

  const handleRemoveItem = async (itemId, itemTitle) => {
    showConfirm(
      `Are you sure you want to remove "${itemTitle}"? This action cannot be undone.`,
      async () => {
        try {
          await removeItem(itemId);
          // Log the admin action
          await logAdminAction('remove_item', {
            itemId,
            itemTitle,
            removedAt: new Date()
          });
          showSuccess("Item removed successfully!");
        } catch (error) {
          console.error("Error removing item:", error);
          showError("Failed to remove item. Please try again.");
        }
      },
      "Confirm Removal",
      "Remove",
      "Cancel"
    );
  };

  const handleUpdateBugReportStatus = async (reportId, newStatus) => {
    try {
      await updateDoc(doc(db, "bugReports", reportId), {
        status: newStatus
      });
      await logAdminAction('update_bug_report_status', {
        reportId,
        newStatus,
        updatedAt: new Date()
      });
      showSuccess(`Bug report marked as ${newStatus}!`);
    } catch (error) {
      console.error("Error updating bug report status:", error);
      showError("Failed to update bug report status.");
    }
  };

  const handleDeleteBugReport = async (reportId, reportDescription) => {
    showConfirm(
      `Er du sikker på at du vil slette denne fejlrapport? Denne handling kan ikke fortrydes.\n\n"${reportDescription.substring(0, 100)}${reportDescription.length > 100 ? '...' : ''}"`,
      async () => {
        try {
          await deleteDoc(doc(db, "bugReports", reportId));
          await logAdminAction('delete_bug_report', {
            reportId,
            deletedAt: new Date()
          });
          showSuccess("Fejlrapport slettet!");
        } catch (error) {
          console.error("Error deleting bug report:", error);
          showError("Kunne ikke slette fejlrapport. Prøv igen.");
        }
      },
      "Bekræft Sletning",
      "Slet",
      "Annuller"
    );
  };

  if (adminLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-gray-500 mt-2">Contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.displayName} ({user.email})</p>
          </div>
          <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
            <Shield className="text-orange-600" size={20} />
            <span className="text-orange-800 font-medium">Admin</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="text-blue-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="text-green-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="text-orange-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Recent Items (today)</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.recentItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Flagged Items</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.flaggedItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Bug className="text-purple-500 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Bug Reports</p>
              <p className="text-2xl font-bold text-gray-800">{adminStats.bugReports || 0}</p>
              <p className="text-xs text-purple-600">{adminStats.openBugReports || 0} open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Manage Listings</h2>
          <p className="text-sm text-gray-600 mt-1">Remove inappropriate or expired listings</p>
        </div>
        
        <div className="p-6">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <LoadingPlaceholder
                      src={item.imageUrl || "https://via.placeholder.com/60"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                      placeholderClassName="rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600 truncate">Posted by: {item.userName}</p>
                      <p className="text-xs text-gray-500">
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || 
                         new Date(item.createdAt).toLocaleDateString() ||
                         item.timestamp?.toDate?.()?.toLocaleDateString() ||
                         new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex-shrink-0 w-full sm:w-auto"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No items available.</p>
          )}
        </div>
      </div>

      {/* Bug Reports Management */}
      <div className="bg-white rounded-lg shadow-md mt-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Bug Reports</h2>
          <p className="text-sm text-gray-600 mt-1">Review and manage user-reported issues</p>
        </div>
        
        <div className="p-6">
          {bugReportsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading bug reports...</p>
            </div>
          ) : bugReports.length > 0 ? (
            <div className="space-y-4">
              {bugReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 lg:mr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          report.status === 'open' 
                            ? 'bg-red-100 text-red-800' 
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status || 'open'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {report.createdAt?.toDate?.()?.toLocaleDateString('da-DK') || 'Unknown date'}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3 break-words">{report.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
                        {report.imageUrl && (
                          <LoadingPlaceholder 
                            src={report.imageUrl} 
                            alt="Bug screenshot" 
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition flex-shrink-0"
                            placeholderClassName="rounded border"
                          >
                            <div 
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => window.open(report.imageUrl, '_blank')}
                              title="Click to view full size"
                            />
                          </LoadingPlaceholder>
                        )}
                        
                        <div className="text-xs text-gray-500 space-y-1 flex-1 min-w-0">
                          <p className="break-words"><strong>User:</strong> {report.userName} ({report.userEmail})</p>
                          <p className="break-words"><strong>Browser:</strong> {report.userAgent?.split(' ').slice(-2).join(' ') || 'Unknown'}</p>
                          <p className="break-words"><strong>URL:</strong> {report.url || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-2 lg:space-y-2 lg:flex-shrink-0">
                      {report.status === 'open' && (
                        <button
                          onClick={() => handleUpdateBugReportStatus(report.id, 'resolved')}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition flex-1 lg:flex-none whitespace-nowrap"
                        >
                          <CheckCircle size={12} />
                          <span className="hidden sm:inline">Mark Resolved</span>
                          <span className="sm:hidden">Resolve</span>
                        </button>
                      )}
                      
                      {report.status === 'resolved' && (
                        <button
                          onClick={() => handleUpdateBugReportStatus(report.id, 'open')}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition flex-1 lg:flex-none whitespace-nowrap"
                        >
                          <Eye size={12} />
                          <span>Reopen</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteBugReport(report.id, report.description)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex-1 lg:flex-none whitespace-nowrap"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No bug reports yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin; 