import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, orderBy } from "firebase/firestore";
import { AlertTriangle, Trash2 } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const AdminUsers = () => {
  const { user } = useAuth();
  const { items } = useItems();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { 
    isAdmin, 
    adminLoading,
    logAdminAction
  } = useAdmin();
  
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch ALL users from users collection and add item statistics
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsersData = async () => {
      try {
        setUsersLoading(true);
        
        // Query all users from the users collection
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const allUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Calculate stats for each user based on their items
          const usersWithStats = allUsers.map(userData => {
            const userItems = items.filter(item => item.userId === userData.id);
            
            // Determine last active time
            let lastActive;
            if (userItems.length > 0) {
              // User has created items - use the most recent item creation date
              lastActive = userItems.reduce((latest, item) => {
                const itemDate = item.createdAt?.toDate?.() || new Date(item.createdAt) || new Date();
                return itemDate > latest ? itemDate : latest;
              }, new Date(0));
            } else {
              // User hasn't created items - use their account creation date
              lastActive = userData.createdAt?.toDate?.() || new Date(userData.createdAt) || new Date();
            }

            return {
              ...userData,
              displayName: userData.name || userData.displayName || 'Ukendt bruger',
              itemCount: userItems.length,
              lastActive,
              profileImageUrl: userData.photoURL || "/default_pfp.jpg"
            };
          });

          // Sort by last active (most recent first)
          const sortedUsers = usersWithStats.sort((a, b) => b.lastActive - a.lastActive);
          setUsers(sortedUsers);
          setUsersLoading(false);
        }, (error) => {
          console.error("Error fetching users:", error);
          setUsersLoading(false);
        });

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up users listener:", error);
        setUsersLoading(false);
      }
    };

    const unsubscribe = fetchUsersData();
    
    // Cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [items, isAdmin]);

  const handleDeleteUser = async (userId, userName) => {
    // Validate inputs before proceeding
    if (!userId || typeof userId !== 'string') {
      showError(`Ugyldig bruger ID: ${userId}. Kan ikke slette bruger.`);
      return;
    }
    
    showConfirm(
      `Er du sikker på at du vil slette brugeren "${userName}"? Dette vil slette brugeren og ALLE deres data (opslag, beskeder, anmeldelser, osv.). Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          // Get the Firebase Auth ID token
          const idToken = await user.getIdToken();
          
          // Prepare request payload
          const requestPayload = {
            targetUserId: userId
          };
          
          // Make direct HTTP request to the function
          const response = await fetch('https://us-central1-roskilde-trade.cloudfunctions.net/deleteUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(requestPayload)
          });
          
          // Better error handling
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
          }
          
          const result = await response.json();
          
          // Show success with deletion summary
          const { deletedItems } = result;
          const totalDeleted = deletedItems.items + deletedItems.bugReports + 
                              deletedItems.flags + deletedItems.chats;
          
          // Log admin action (this is now also logged server-side in adminActions collection)
          await logAdminAction('delete_user', {
            userId,
            userName,
            totalDeleted,
            breakdown: deletedItems,
            deletedAt: new Date()
          });

          showSuccess(
            `Bruger "${userName}" er blevet slettet! 
            Total slettet: ${totalDeleted} elementer 
            (${deletedItems.items} opslag, ${deletedItems.chats} beskeder, 
            ${deletedItems.bugReports} fejlrapporter, ${deletedItems.flags} anmeldelser)`
          );
          
        } catch (error) {
          console.error("Error deleting user:", error);
          if (error.message.includes('Permission denied')) {
            showError("Du har ikke tilladelse til at slette brugere. Kun admins kan slette brugere.");
          } else if (error.message.includes('Unauthorized')) {
            showError("Du skal være logget ind som admin for at slette brugere.");
          } else {
            showError(`Kunne ikke slette bruger: ${error.message}. Prøv igen eller kontakt support.`);
          }
        }
      },
      "Bekræft Sletning",
      "Slet Bruger",
      "Annuller"
    );
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Brugerstyring</h1>
          <p className="text-gray-600">Administrer registrerede brugere</p>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Alle Brugere</h2>
          <p className="text-sm text-gray-600 mt-1">Gennemgå og administrer alle registrerede brugere</p>
        </div>
        
        <div className="p-6">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Indlæser brugere...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((userData) => (
                <div key={userData.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <LoadingPlaceholder
                      src={userData.profileImageUrl || "/default_pfp.jpg"}
                      alt={userData.displayName}
                      className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                      placeholderClassName="rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-800 truncate">{userData.displayName}</h3>
                      <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500">
                          {userData.itemCount} opslag
                        </p>
                        <p className="text-xs text-gray-500">
                          Sidst aktiv: {userData.lastActive.toLocaleDateString('da-DK')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && userData.id !== user.uid && (
                    <button
                      onClick={() => handleDeleteUser(userData.id, userData.displayName)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex-shrink-0 w-full sm:w-auto"
                    >
                      <Trash2 size={16} />
                      <span>Slet Bruger</span>
                    </button>
                  )}
                  
                  {userData.id === user.uid && (
                    <div className="flex items-center justify-center px-3 py-2 bg-orange-100 text-orange-800 rounded-lg flex-shrink-0 w-full sm:w-auto">
                      <span className="font-medium">Det er dig!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">Ingen brugere fundet.</p>
          )}
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Vigtigt at vide</h3>
            <p className="text-sm text-yellow-700">
              Når du sletter en bruger, slettes alle deres opslag også. Brugerens Firebase Authentication konto vil stadig eksistere, 
              men alle deres data i appen fjernes. Dette kan ikke fortrydes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 