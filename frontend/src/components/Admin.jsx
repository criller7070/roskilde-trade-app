import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { Trash2, Users, Package, AlertTriangle, Shield } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { items, removeItem } = useItems();
  const { 
    isAdmin, 
    adminLoading, 
    adminStats, 
    logAdminAction,
    updateAdminStats
  } = useAdmin();

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
        flaggedItems: items.filter(item => item.flagged).length || 0
      };
      updateAdminStats(newStats);
    }
  }, [items, isAdmin]);

  const handleRemoveItem = async (itemId, itemTitle) => {
    const confirmed = window.confirm(`Are you sure you want to remove "${itemTitle}"? This action cannot be undone.`);
    if (confirmed) {
      try {
        await removeItem(itemId);
        // Log the admin action
        await logAdminAction('remove_item', {
          itemId,
          itemTitle,
          removedAt: new Date()
        });
        alert("Item removed successfully!");
      } catch (error) {
        console.error("Error removing item:", error);
        alert("Failed to remove item. Please try again.");
      }
    }
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/60"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">Posted by: {item.userName}</p>
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
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
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
    </div>
  );
};

export default Admin; 