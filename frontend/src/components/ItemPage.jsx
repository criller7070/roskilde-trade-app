import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { usePopupContext } from "../contexts/PopupContext";
import { Flag, X } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const ItemPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateChatId } = useChat();
  const { showSuccess, showError } = usePopupContext();
  const [item, setItem] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagComment, setFlagComment] = useState("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const flagReasons = [
    "Upassende indhold",
    "Spam eller reklame", 
    "Falsk opslag",
    "Vildledende information",
    "Ulovligt indhold",
    "Andet"
  ];

  useEffect(() => {
    const fetchItemAndSeller = async () => {
      try {
        const itemRef = doc(db, "items", itemId);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) return;

        const itemData = { id: itemSnap.id, ...itemSnap.data() };
        setItem(itemData);

        // Try to fetch seller profile, but don't fail if we can't access it
        try {
          const sellerRef = doc(db, "users", itemData.userId);
          const sellerSnap = await getDoc(sellerRef);

          if (sellerSnap.exists()) {
            setSellerProfile(sellerSnap.data());
          }
        } catch (sellerErr) {
          if (import.meta.env.DEV) {
            console.log("Could not fetch seller profile (permissions)");
          }
          // Set a minimal seller profile with just the userName from the item
          setSellerProfile({ displayName: itemData.userName });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Failed to load item or seller:", err.code);
        }
      }
    };

    fetchItemAndSeller();
  }, [itemId]);

  const handleStartChat = () => {
    if (!user) {
      // Handle not logged in case
      return;
    }
    
    const chatId = generateChatId(user.uid, item.userId, item.id);
    navigate(`/chat/${chatId}`, { 
      state: { 
        itemId: item.id,
        itemName: item.title,
        itemImage: item.imageUrl,
        recipientName: item.userName,
        recipientId: item.userId
      }
    });
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError("Du skal være logget ind for at rapportere opslag.");
      return;
    }

    if (!flagReason) {
      showError("Vælg venligst en grund til rapportering.");
      return;
    }

    setIsSubmittingFlag(true);

    try {
      // Create flag report
      await addDoc(collection(db, "flags"), {
        itemId: item.id,
        itemTitle: item.title,
        itemUserId: item.userId,
        itemUserName: item.userName,
        reporterId: user.uid,
        reporterName: user.displayName || user.email,
        reporterEmail: user.email,
        reason: flagReason,
        comment: flagComment,
        createdAt: new Date(),
        status: "open"
      });

      // Optionally update the item to mark it as flagged
      await updateDoc(doc(db, "items", item.id), {
        flagged: true,
        flagCount: (item.flagCount || 0) + 1
      });

      showSuccess("Opslag rapporteret! Tak for din feedback.");
      setShowFlagModal(false);
      setFlagReason("");
      setFlagComment("");
      
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting flag:", error.code);
      }
      showError("Kunne ikke rapportere opslag. Prøv igen.");
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  if (!item) return <p className="text-center mt-10">Indlæser...</p>;

  return (
    <div className="pt-4 px-4 pb-10 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-orange-500 text-center flex-1">{item.title}</h1>
        {user && item.userId !== user.uid && (
          <button
            onClick={() => setShowFlagModal(true)}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Rapportér opslag"
          >
            <Flag size={20} />
          </button>
        )}
      </div>
      
      <LoadingPlaceholder
        src={item.imageUrl || "/placeholder.jpg"}
        alt={item.title}
        className="w-full max-w-sm max-h-64 object-cover rounded-lg border mb-4 mx-auto"
        placeholderClassName="rounded-lg border max-w-sm max-h-64 mx-auto"
      />

      <h2 className="text-lg font-bold text-orange-500 mb-1">Beskrivelse</h2>
      <p className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 mb-6">
        {item.description}
      </p>

      <div className="flex items-center gap-3 p-3 rounded-xl shadow bg-white mb-4">
        <LoadingPlaceholder
          src={sellerProfile?.photoURL || "/default_pfp.jpg"}
          alt={item.userName}
          className="w-10 h-10 rounded-full object-cover"
          placeholderClassName="rounded-full"
          fallbackSrc="/default_pfp.jpg"
        />
        <div className="flex-1">
          <p className="text-sm font-bold">{item.userName}</p>
          {user && item.userId === user.uid ? (
            <p className="text-xs text-green-600 font-medium">Dette er dit opslag</p>
          ) : (
            <p className="text-xs text-gray-500">Skriv til sælger her</p>
          )}
        </div>
        {user && item.userId !== user.uid && (
          <button
            onClick={handleStartChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
          >
            Message {item.userName}
          </button>
        )}
        {!user && (
          <p className="text-sm text-red-500">Please log in to message the seller.</p>
        )}
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Rapportér opslag</h3>
                <button
                  onClick={() => setShowFlagModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFlagSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hvad er problemet med dette opslag?
                  </label>
                  <div className="space-y-2">
                    {flagReasons.map((reason) => (
                      <label key={reason} className="flex items-center">
                        <input
                          type="radio"
                          name="flagReason"
                          value={reason}
                          checked={flagReason === reason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yderligere kommentarer (valgfrit)
                  </label>
                  <textarea
                    value={flagComment}
                    onChange={(e) => setFlagComment(e.target.value)}
                    placeholder="Beskriv problemet nærmere..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFlagModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFlag || !flagReason}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isSubmittingFlag ? "Rapporterer..." : "Rapportér"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;
