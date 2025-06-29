import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertTriangle } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const AdminPosts = () => {
  const { user } = useAuth();
  const { items, removeItem } = useItems();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const navigate = useNavigate();
  const { 
    isAdmin, 
    adminLoading, 
    logAdminAction
  } = useAdmin();

  const handleRemoveItem = async (itemId, itemTitle) => {
    showConfirm(
      `Er du sikker på at du vil slette "${itemTitle}"? Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          await removeItem(itemId);
          // Log the admin action
          await logAdminAction('remove_item', {
            itemId,
            itemTitle,
            removedAt: new Date()
          });
          showSuccess("Opslag fjernet!");
        } catch (error) {
          console.error("Error removing item:", error);
          showError("Kunne ikke fjerne opslag. Prøv igen.");
        }
      },
      "Bekræft Fjernelse",
      "Fjern",
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrer Opslag</h1>
        <p className="text-gray-600">Fjern upassende eller udløbne opslag</p>
      </div>

      {/* Items Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Alle Opslag</h2>
          <p className="text-sm text-gray-600 mt-1">Gennemgå og administrer alle brugeropslag</p>
        </div>
        
        <div className="p-6">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div 
                      onClick={() => navigate(`/item/${item.id}`)}
                      className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      title="Klik for at se opslag"
                    >
                      <LoadingPlaceholder
                        src={item.imageUrl || "https://via.placeholder.com/60"}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                        placeholderClassName="rounded"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600 truncate">Lagt op af: {item.userName}</p>
                      <p className="text-xs text-gray-500">
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || 
                         new Date(item.createdAt).toLocaleDateString() ||
                         item.timestamp?.toDate?.()?.toLocaleDateString() ||
                         new Date(item.timestamp).toLocaleDateString()}
                      </p>
                      {item.flagged && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mt-1">
                          Flagget
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveItem(item.id, item.title)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex-shrink-0 w-full sm:w-auto"
                    >
                      <Trash2 size={16} />
                      <span>Fjern</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">Ingen opslag tilgængelige.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPosts; 