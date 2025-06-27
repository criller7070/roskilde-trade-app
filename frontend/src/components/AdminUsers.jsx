import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
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

  // Get unique users from items and fetch their details from users collection
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsersData = async () => {
      try {
        setUsersLoading(true);
        
        // Get unique user IDs from items
        const userIds = [...new Set(items.map(item => item.userId).filter(Boolean))];
        
        if (userIds.length === 0) {
          setUsers([]);
          setUsersLoading(false);
          return;
        }

        // Fetch user documents from users collection
        const userPromises = userIds.map(async (userId) => {
          try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              return { id: userId, ...userSnap.data() };
            } else {
              // Fallback to item data if user document doesn't exist
              const userItems = items.filter(item => item.userId === userId);
              const firstItem = userItems[0];
              return {
                id: userId,
                displayName: firstItem?.userName || 'Ukendt bruger',
                email: 'Ukendt email', // Fixed the text
                photoURL: firstItem?.userProfileImage || null
              };
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            // Fallback to item data
            const userItems = items.filter(item => item.userId === userId);
            const firstItem = userItems[0];
            return {
              id: userId,
              displayName: firstItem?.userName || 'Ukendt bruger',
              email: 'Ukendt email',
              photoURL: firstItem?.userProfileImage || null
            };
          }
        });

        const usersData = await Promise.all(userPromises);
        
        // Calculate stats for each user
        const usersWithStats = usersData.map(userData => {
          const userItems = items.filter(item => item.userId === userData.id);
          const lastActive = userItems.length > 0 
            ? userItems.reduce((latest, item) => {
                const itemDate = item.createdAt?.toDate?.() || new Date(item.createdAt) || new Date();
                return itemDate > latest ? itemDate : latest;
              }, new Date(0))
            : new Date();

          return {
            ...userData,
            itemCount: userItems.length,
            lastActive,
            profileImageUrl: userData.photoURL || "/default_pfp.jpg"
          };
        });

        const sortedUsers = usersWithStats.sort((a, b) => b.lastActive - a.lastActive);
        setUsers(sortedUsers);
        setUsersLoading(false);
      } catch (error) {
        console.error("Error fetching users data:", error);
        setUsersLoading(false);
      }
    };

    fetchUsersData();
  }, [items, isAdmin]);

  const handleDeleteUser = async (userId, userName) => {
    showConfirm(
      `Er du sikker på at du vil slette brugeren "${userName}"? Dette vil slette brugeren og ALLE deres opslag. Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          // First, delete all items by this user
          const userItems = items.filter(item => item.userId === userId);
          const deletePromises = userItems.map(item => 
            deleteDoc(doc(db, "items", item.id))
          );
          
          await Promise.all(deletePromises);

          // Note: We can't delete the Firebase Auth user from the client side
          // This would need to be done through Firebase Admin SDK on the server
          // For now, we'll just remove their data and log the action
          
          await logAdminAction('delete_user', {
            userId,
            userName,
            itemsDeleted: userItems.length,
            deletedAt: new Date()
          });

          showSuccess(`Bruger "${userName}" og ${userItems.length} opslag er blevet slettet!`);
        } catch (error) {
          console.error("Error deleting user:", error);
          showError("Kunne ikke slette bruger. Prøv igen.");
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Brugerstyring</h1>
        <p className="text-gray-600">Administrer registrerede brugere</p>
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