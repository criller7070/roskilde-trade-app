import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useItems } from "../contexts/ItemsContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { AlertTriangle, Flag, Trash2, Eye, CheckCircle, X } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const AdminFlagged = () => {
  const { user } = useAuth();
  const { items } = useItems();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { 
    isAdmin, 
    adminLoading, 
    logAdminAction
  } = useAdmin();
  
  const [flagsData, setFlagsData] = useState([]);
  const [flagsLoading, setFlagsLoading] = useState(true);

  // Get flagged items with their flag reports
  useEffect(() => {
    // Don't start listener if admin status is still loading or user is not admin
    if (adminLoading || !user || !isAdmin) return;

    const flaggedItems = items.filter(item => item.flagged);
    setFlagsLoading(true);

    if (flaggedItems.length === 0) {
      setFlagsData([]);
      setFlagsLoading(false);
      return;
    }

    // Get flag reports for flagged items
    const q = query(collection(db, "flags"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allFlags = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));

      // Create combined data structure
      const combinedData = flaggedItems.map(item => {
        const itemFlags = allFlags.filter(flag => flag.itemId === item.id);
        return {
          item,
          flags: itemFlags,
          hasFlags: itemFlags.length > 0,
          openFlags: itemFlags.filter(flag => flag.status === 'open').length
        };
      });

      setFlagsData(combinedData);
      setFlagsLoading(false);
    }, (error) => {
      console.error("Error fetching flags:", error);
      setFlagsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, adminLoading, user, items]);

  const handleUpdateFlagStatus = async (flagId, newStatus) => {
    try {
      // Find the flag in our data structure
      let foundFlag = null;
      let foundItem = null;
      
      for (const data of flagsData) {
        const flag = data.flags.find(f => f.id === flagId);
        if (flag) {
          foundFlag = flag;
          foundItem = data.item;
          break;
        }
      }
      
      if (!foundFlag || !foundItem) return;

      // Update flag status
      await updateDoc(doc(db, "flags", flagId), {
        status: newStatus,
        reviewedAt: new Date()
      });

      // Get all flags for this item
      const itemData = flagsData.find(data => data.item.id === foundItem.id);
      const allItemFlags = itemData ? itemData.flags : [];
      
      // Check if there are other open flags for the same item
      const otherOpenFlags = allItemFlags.filter(f => 
        f.id !== flagId && 
        f.status === 'open'
      );

      // Update item flagged status based on remaining open flags
      if (newStatus === 'resolved' && otherOpenFlags.length === 0) {
        // No more open flags for this item - unflag it
        await updateDoc(doc(db, "items", foundItem.id), {
          flagged: false
        });
      } else if (newStatus === 'open') {
        // Flag reopened - make sure item is flagged
        await updateDoc(doc(db, "items", foundItem.id), {
          flagged: true
        });
      }

      await logAdminAction('update_flag_status', {
        flagId,
        newStatus,
        itemId: foundItem.id,
        updatedAt: new Date()
      });
      showSuccess(`Flag markeret som ${newStatus}!`);
    } catch (error) {
      console.error("Error updating flag status:", error);
      showError("Kunne ikke opdatere flag.");
    }
  };

  const handleDeleteFlag = async (flagId, flagReason) => {
    showConfirm(
      `Er du sikker på at du vil slette denne flag-rapport? Denne handling kan ikke fortrydes.\n\n"${flagReason}"`,
      async () => {
        try {
          await deleteDoc(doc(db, "flags", flagId));
          await logAdminAction('delete_flag', {
            flagId,
            deletedAt: new Date()
          });
          showSuccess("Flag-rapport slettet!");
        } catch (error) {
          console.error("Error deleting flag:", error);
          showError("Kunne ikke slette flag-rapport. Prøv igen.");
        }
      },
      "Bekræft Sletning",
      "Slet",
      "Annuller"
    );
  };

  const handleRemoveFlaggedItem = async (itemId, itemTitle) => {
    showConfirm(
      `Er du sikker på at du vil slette det flaggede opslag "${itemTitle}"? Denne handling kan ikke fortrydes.`,
      async () => {
        try {
          await deleteDoc(doc(db, "items", itemId));
          await logAdminAction('remove_flagged_item', {
            itemId,
            itemTitle,
            removedAt: new Date()
          });
          showSuccess("Flagget opslag fjernet!");
        } catch (error) {
          console.error("Error removing flagged item:", error);
          showError("Kunne ikke fjerne opslag. Prøv igen.");
        }
      },
      "Bekræft Fjernelse",
      "Fjern Opslag",
      "Annuller"
    );
  };

  const handleUnflagItem = async (itemId, itemTitle) => {
    showConfirm(
      `Er du sikker på at du vil fjerne flag fra "${itemTitle}"? Opslaget vil ikke længere være markeret som flagget.`,
      async () => {
        try {
          await updateDoc(doc(db, "items", itemId), {
            flagged: false
          });
          await logAdminAction('unflag_item', {
            itemId,
            itemTitle,
            unflaggedAt: new Date()
          });
          showSuccess("Opslag ikke længere flagget!");
        } catch (error) {
          console.error("Error unflagging item:", error);
          showError("Kunne ikke fjerne flag. Prøv igen.");
        }
      },
      "Bekræft Unflagging",
      "Fjern Flag",
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Flaggede Opslag</h1>
        <p className="text-gray-600">Gennemgå og administrer brugerrapporterede opslag</p>
      </div>

      {/* Flagged Items Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Flaggede Opslag</h2>
          <p className="text-sm text-gray-600 mt-1">Vis og administrer alle opslag der er markeret som flaggede</p>
        </div>
        
        <div className="p-6">
          {flagsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Indlæser flaggede opslag...</p>
            </div>
          ) : flagsData.length > 0 ? (
            <div className="space-y-6">
              {flagsData.map((data) => (
                <div key={data.item.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 lg:mr-6">
                      {/* Flagged Item Info */}
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <LoadingPlaceholder
                            src={data.item.imageUrl || "/placeholder.jpg"}
                            alt={data.item.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                            placeholderClassName="rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Flag className="text-red-500 flex-shrink-0" size={16} />
                              <h3 className="font-semibold text-gray-800">{data.item.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              Lagt op af: <strong>{data.item.userName}</strong>
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                Oprettet: {data.item.createdAt?.toDate?.()?.toLocaleDateString('da-DK') || 'Ukendt'}
                              </span>
                              {data.hasFlags && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  {data.flags.length} flag rapport{data.flags.length !== 1 ? 'er' : ''}
                                  {data.openFlags > 0 && ` (${data.openFlags} åben)`}
                                </span>
                              )}
                              {!data.hasFlags && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  Ingen flag rapporter
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flag Reports */}
                      {data.hasFlags ? (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-800">Flag Rapporter:</h4>
                          {data.flags.map((flag) => (
                            <div key={flag.id} className="bg-gray-50 p-3 rounded border-l-4 border-orange-400">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs rounded font-medium ${
                                  flag.status === 'open' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {flag.status === 'open' ? 'Åben' : 'Løst'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {flag.createdAt?.toDate?.()?.toLocaleDateString('da-DK') || 'Ukendt'}
                                </span>
                              </div>
                              <p className="text-sm mb-1">
                                <strong>Grund:</strong> {flag.reason}
                              </p>
                              {flag.comment && (
                                <p className="text-sm mb-1">
                                  <strong>Kommentar:</strong> "{flag.comment}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Rapporteret af: {flag.reporterName}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {flag.status === 'open' && (
                                  <button
                                    onClick={() => handleUpdateFlagStatus(flag.id, 'resolved')}
                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Markér Løst
                                  </button>
                                )}
                                {flag.status === 'resolved' && (
                                  <button
                                    onClick={() => handleUpdateFlagStatus(flag.id, 'open')}
                                    className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                                  >
                                    Genåbn
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteFlag(flag.id, flag.reason)}
                                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  Slet Flag
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                          <p className="text-sm text-yellow-700">
                            Dette opslag er markeret som flagget, men har ingen flag rapporter. 
                            Det kan være flagget manuelt eller alle flag rapporter er blevet slettet.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 lg:flex-shrink-0 lg:w-40">
                      <button
                        onClick={() => handleUnflagItem(data.item.id, data.item.title)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        <CheckCircle size={14} />
                        <span>Fjern Flag</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFlaggedItem(data.item.id, data.item.title)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        <X size={14} />
                        <span>Slet Opslag</span>
                      </button>

                      <a
                        href={`/item/${data.item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
                      >
                        <Eye size={14} />
                        <span>Se Opslag</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">Ingen flaggede opslag.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFlagged; 