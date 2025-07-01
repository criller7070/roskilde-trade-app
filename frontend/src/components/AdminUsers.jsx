import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, deleteDoc, getDoc, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { AlertTriangle, Users, Trash2 } from "lucide-react";
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
  const [orphanedUsers, setOrphanedUsers] = useState([]);
  const [syncingUsers, setSyncingUsers] = useState(false);

  // Fetch ALL users from users collection and add item statistics
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsersData = async () => {
      try {
        setUsersLoading(true);
        
        // Query all users from the users collection
        const usersRef = collection(db, "users");
        const usersQuery = query(usersRef);
        
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
    showConfirm(
      `Er du sikker på at du vil slette brugeren "${userName}"? Dette vil slette brugeren og ALLE deres data (opslag, beskeder, anmeldelser, osv.). Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          // SECURE: Use server-side function for complete admin deletion
          const functions = getFunctions();
          const deleteUserFunction = httpsCallable(functions, 'deleteUser');
          
          if (import.meta.env.DEV) {
            console.log(`Admin deleting user: ${userId} (${userName})`);
          }
          
          const result = await deleteUserFunction({ 
            targetUserId: userId 
          });
          
          if (import.meta.env.DEV) {
            console.log('Admin deletion result:', result.data);
          }
          
          // Show success with deletion summary
          const { deletedItems } = result.data;
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
          if (error.code === 'functions/permission-denied') {
            showError("Du har ikke tilladelse til at slette brugere. Kun admins kan slette brugere.");
          } else if (error.code === 'functions/unauthenticated') {
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

  // Function to find and clean up orphaned user documents
  const syncUsers = async () => {
    setSyncingUsers(true);
    try {
      // Get all users from Firestore
      const usersQuery = query(collection(db, "users"));
      const firestoreSnapshot = await getDocs(usersQuery);
      const firestoreUsers = firestoreSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get current authenticated users (we can't directly query Firebase Auth from client)
      // Instead, we'll check if each Firestore user still has valid auth
      const orphaned = [];
      
      for (const firestoreUser of firestoreUsers) {
        try {
          // Try to get user by UID from current auth context
          // If this fails, the user likely doesn't exist in Auth anymore
          
          // For now, we'll identify potentially orphaned users by checking if they have items
          // This is a safer approach than trying to validate auth directly
          const userItems = items.filter(item => item.userId === firestoreUser.id);
          const hasNoActivity = userItems.length === 0;
          
          // Check if user was created recently (less likely to be orphaned)
          const createdAt = firestoreUser.createdAt?.toDate?.() || new Date(firestoreUser.createdAt) || new Date();
          const daysSinceCreation = (new Date() - createdAt) / (1000 * 60 * 60 * 24);
          
          // Flag as potentially orphaned if: no activity AND created more than 1 day ago
          if (hasNoActivity && daysSinceCreation > 1) {
            orphaned.push({
              ...firestoreUser,
              reason: 'No activity and old account'
            });
          }
        } catch (error) {
          console.error(`Error checking user ${firestoreUser.id}:`, error);
        }
      }

      setOrphanedUsers(orphaned);
      
      if (orphaned.length > 0) {
        showConfirm(
          `Fundet ${orphaned.length} potentielt orphaned brugerkonti, dvs disse brugere har ingen aktivitet og kan være slettet fra Firebase Authentication. Vil du se listen?`,
          () => {
            // Show the list in console for now
            console.log('Potentially orphaned users:', orphaned);
            showSuccess(`Se konsollen for liste over ${orphaned.length} potentielt orphaned konti.`);
          },
          "Vis Liste",
          "Vis i Konsol",
          "Annuller"
        );
      } else {
        showSuccess("Ingen orphaned brugerkonti fundet!");
      }
      
    } catch (error) {
      console.error("Error syncing users:", error);
      showError("Kunne ikke synkronisere brugere. Prøv igen.");
    } finally {
      setSyncingUsers(false);
    }
  };

  const cleanupOrphanedUser = async (userId, userName) => {
    showConfirm(
      `Er du sikker på at du vil slette den orphaned bruger "${userName}"? Dette vil kun slette Firestore-dokumentet.`,
      async () => {
        try {
          await deleteDoc(doc(db, "users", userId));
          await logAdminAction('cleanup_orphaned_user', {
            userId,
            userName,
            cleanedAt: new Date()
          });
          showSuccess(`Orphaned bruger "${userName}" blev slettet!`);
          // Remove from orphaned list
          setOrphanedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
          console.error("Error cleaning up orphaned user:", error);
          showError("Kunne ikke slette Orphaned bruger. Prøv igen.");
        }
      },
      "Bekræft Oprydning",
      "Slet Orphaned",
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Brugerstyring</h1>
            <p className="text-gray-600">Administrer registrerede brugere</p>
          </div>
          <button
            onClick={syncUsers}
            disabled={syncingUsers}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              syncingUsers 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {syncingUsers ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Synkroniserer...</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span>Synkroniser Brugere</span>
              </>
            )}
          </button>
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

      {/* Orphaned Users Section */}
      {orphanedUsers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <div className="p-6 border-b border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-800">Potentielt Orphaned Konti</h2>
            <p className="text-sm text-yellow-700 mt-1">Disse brugere har ingen aktivitet og kan være slettet fra Firebase Auth</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {orphanedUsers.map((userData) => (
                <div key={userData.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white border border-yellow-300 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-yellow-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-800 truncate">{userData.name || userData.displayName || 'Ukendt'}</h3>
                      <p className="text-sm text-gray-600 truncate">{userData.email}</p>
                      <p className="text-xs text-yellow-600">{userData.reason}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => cleanupOrphanedUser(userData.id, userData.name || userData.displayName || userData.email)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex-shrink-0 w-full sm:w-auto"
                  >
                    <Trash2 size={16} />
                    <span>Ryd Op</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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