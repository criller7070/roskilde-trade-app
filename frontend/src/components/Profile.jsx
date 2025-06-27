import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc as fsDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { PlusCircle, Camera, Repeat2, DollarSign, Trash2, AlertTriangle, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePopupContext } from "../contexts/PopupContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, signOut } from "firebase/auth";
import { auth } from "../firebase";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Profile = () => {
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = usePopupContext();
  const [posts, setPosts] = useState([]);

  /* ---------- avatar-upload state ---------- */
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  /* ---------- fetch user’s items ---------- */
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      const q = query(collection(db, "items"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const itemData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // Sort by createdAt in JavaScript instead of Firestore
      const sortedData = itemData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // Newest first
      });
      
      setPosts(sortedData);
    };

    fetchUserPosts();
  }, [user, navigate]);

  /* ---------- file-picker handler ---------- */
  const handleSelect = (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  /* ---------- upload + profile patch ---------- */
  const handleUpload = async () => {
    if (!file || !user) return;
    setSaving(true);
    try {
      // 1. push bytes to Cloud Storage
      const fileRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(fileRef, file);

      // 2. grab a public URL
      const url = await getDownloadURL(fileRef);

      // 3. update BOTH Auth profile and Firestore doc
      await Promise.all([
        updateProfile(user, { photoURL: url }),
        updateDoc(fsDoc(db, "users", user.uid), { photoURL: url }),
      ]);

      // 4. clear local state & refresh context
      setFile(null);
      setPreview("");
      window.location.reload();
    } catch (err) {
      alert("Kunne ikke uploade billede: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- delete post functionality ---------- */
  const handleDeletePost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      
      // 1. Delete the post document
      await deleteDoc(fsDoc(db, "items", postId));
      
      // 2. Find and update all related chats
      await handleDeletedItemChats(postId, post?.title || "Deleted Item");
      
      // 3. Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      showSuccess("Opslag slettet!");
    } catch (err) {
      console.error("Error deleting post:", err);
      showError("Kunne ikke slette opslag: " + err.message);
    }
  };

  /* ---------- handle chats for deleted items ---------- */
  const handleDeletedItemChats = async (itemId, itemTitle) => {
    try {
      // Query all chats related to this item
      const chatsQuery = query(collection(db, "chats"), where("itemId", "==", itemId));
      const chatsSnapshot = await getDocs(chatsQuery);
      
      const updatePromises = [];
      
      chatsSnapshot.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        const chatData = chatDoc.data();
        
        // Update chat metadata to mark item as deleted
        const chatUpdatePromise = updateDoc(fsDoc(db, "chats", chatId), {
          itemName: `${chatData.itemName} [SLETTET]`,
          isItemDeleted: true,
          itemDeletedAt: serverTimestamp()
        });
        updatePromises.push(chatUpdatePromise);
        
        // Send system message to chat participants
        const systemMessagePromise = addDoc(collection(db, `chats/${chatId}/messages`), {
          text: `Dette opslag "${itemTitle}" er blevet slettet af brugeren. Denne chat forbliver åben for jeres samtale.`,
          timestamp: serverTimestamp(),
          senderId: "system",
          isSystemMessage: true
        });
        updatePromises.push(systemMessagePromise);
        
        // Update userChats for both participants
        if (chatData.participants && Array.isArray(chatData.participants)) {
          chatData.participants.forEach(participantId => {
            const userChatUpdatePromise = updateDoc(
              fsDoc(db, "userChats", participantId, "chats", chatId),
              {
                itemName: `${chatData.itemName} [SLETTET]`,
                lastMessage: "Opslag slettet af bruger",
                lastMessageTime: serverTimestamp(),
                unreadCount: 0 // Don't increase unread for system messages
              }
            );
            updatePromises.push(userChatUpdatePromise);
          });
        }
      });
      
      await Promise.all(updatePromises);
      console.log(`Updated ${chatsSnapshot.size} chats for deleted item: ${itemId}`);
      
    } catch (error) {
      console.error("Error handling chats for deleted item:", error);
      // Check if it's a permission error
      if (error.code === 'permission-denied') {
        console.warn("Permission denied when updating chats for deleted item. This is expected if there are no chats for this item or user doesn't have access.");
      }
      // Don't throw - we don't want to prevent the post deletion if chat updates fail
    }
  };

  const confirmDeletePost = (post) => {
    showConfirm(
      "Er du sikker på, at du vil slette dette opslag?",
      () => handleDeletePost(post.id),
      "Slet Opslag",
      "Slet",
      "Annuller"
    );
  };

  /* ---------- delete account functionality ---------- */
  const handleDeleteAccount = async () => {
    try {
      console.log("Starting account deletion process...");
      
      // 1. Delete all user's posts
      const deletePostPromises = posts.map(post => deleteDoc(fsDoc(db, "items", post.id)));
      await Promise.all(deletePostPromises);
      console.log(`Deleted ${posts.length} posts`);
      
      // 2. Handle chats for all deleted items
      for (const post of posts) {
        await handleDeletedItemChats(post.id, post.title);
      }
      
      // 3. Delete all user's chats and related data
      try {
        // Query all chats where user is a participant
        const userChatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
        const userChatsSnapshot = await getDocs(userChatsQuery);
        
        const chatCleanupPromises = [];
        
        userChatsSnapshot.forEach((chatDoc) => {
          const chatId = chatDoc.id;
          const chatData = chatDoc.data();
          
          // Send system message about account deletion
          const systemMessagePromise = addDoc(collection(db, `chats/${chatId}/messages`), {
            text: `Brugeren har slettet sin konto. Denne chat forbliver tilgængelig for de resterende deltagere.`,
            timestamp: serverTimestamp(),
            senderId: "system",
            isSystemMessage: true
          });
          chatCleanupPromises.push(systemMessagePromise);
          
          // Remove user from participants list
          const updatedParticipants = chatData.participants.filter(p => p !== user.uid);
          if (updatedParticipants.length > 0) {
            const updateChatPromise = updateDoc(fsDoc(db, "chats", chatId), {
              participants: updatedParticipants
            });
            chatCleanupPromises.push(updateChatPromise);
          } else {
            // If no participants left, delete the chat
            const deleteChatPromise = deleteDoc(fsDoc(db, "chats", chatId));
            chatCleanupPromises.push(deleteChatPromise);
          }
        });
        
        await Promise.all(chatCleanupPromises);
        console.log("Cleaned up chat data");
        
        // Delete user's userChats document
        const userChatsDocRef = fsDoc(db, "userChats", user.uid);
        await deleteDoc(userChatsDocRef);
        console.log("Deleted userChats document");
        
      } catch (error) {
        console.error("Error cleaning up chat data:", error);
        // Continue with deletion even if chat cleanup fails
      }
      
      // 4. Delete user document from users collection
      try {
        await deleteDoc(fsDoc(db, "users", user.uid));
        console.log("Deleted user document");
      } catch (error) {
        console.error("Error deleting user document:", error);
        // Continue even if user document deletion fails
      }
      
      // 5. Delete any flag reports made by this user
      try {
        const flagsQuery = query(collection(db, "flags"), where("reportedBy", "==", user.uid));
        const flagsSnapshot = await getDocs(flagsQuery);
        const deleteFlagPromises = flagsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteFlagPromises);
        console.log(`Deleted ${flagsSnapshot.size} flag reports`);
      } catch (error) {
        console.error("Error deleting flag reports:", error);
        // Continue even if flag deletion fails
      }
      
      showSuccess("Din konto og alle data er blevet slettet. Du vil blive logget ud om et øjeblik.");
      
      // Wait a moment then properly sign out and redirect
      setTimeout(async () => {
        try {
          await signOut(auth);
          navigate("/");
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
          // Fallback to navigation even if signOut fails
          navigate("/");
          window.location.reload();
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error deleting account:", error);
      showError("Der opstod en fejl ved sletning af din konto. Prøv igen eller kontakt support.");
    }
  };

  const confirmDeleteAccount = () => {
    showConfirm(
      `ADVARSEL: Dette vil permanent slette din konto og ALLE dine data, herunder:

- Alle dine opslag (${posts.length} stk.)
- Din profil og personlige oplysninger
- Alle dine beskeder og chats  
- Alle rapporter du har indsendt

Denne handling kan IKKE fortrydes, og du vil ikke kunne gendanne dine data.

Er du helt sikker på, at du vil fortsætte?`,
      handleDeleteAccount,
      "Slet Konto Permanent",
      "JA, SLET ALT",
      "Nej, behold min konto"
    );
  };

  if (!user) return null;

  return (
    <div className="pt-12 px-4 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4 flex items-center justify-center gap-2">
        Din Profil
      </h1>

      {/* ---------- profile picture block ---------- */}
      <div className="relative w-28 h-28 mx-auto mb-4">
        <LoadingPlaceholder
          src={preview || user.photoURL || "/default_pfp.jpg"}
          alt="avatar"
          className="rounded-full w-full h-full object-cover border-2 border-orange-200"
          placeholderClassName="rounded-full bg-orange-100"
          fallbackSrc="/default_pfp.jpg"
        />

        {/* camera icon → hidden file input */}
        <label
          htmlFor="avatarInput"
          className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer"
        >
          <Camera size={16} />
        </label>
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {/* save button appears only after a file is chosen */}
      {preview && (
        <button
          onClick={handleUpload}
          disabled={saving}
          className="block mx-auto mb-6 bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Uploader…" : "Gem billede"}
        </button>
      )}

      {/* ---------- user info ---------- */}
      <div className="text-center mb-6">
        <p><strong>Navn:</strong> {user.displayName}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* ---------- user’s posts ---------- */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl text-orange-500 font-bold">Dine Opslag</h2>
        <PlusCircle
          className="text-orange-500 cursor-pointer"
          size={28}
          onClick={() => navigate("/add-item")}
        />
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Ingen opslag endnu</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex bg-white rounded-xl shadow p-3 gap-3 items-center"
            >
              <div 
                onClick={() => navigate(`/item/${post.id}`)}
                className="flex gap-3 items-center flex-1 cursor-pointer"
              >
                <LoadingPlaceholder
                  src={post.imageUrl}
                  alt="item"
                  className="w-16 h-16 object-cover rounded-md"
                  placeholderClassName="rounded-md bg-gray-200"
                  fallbackSrc="/default_pfp.jpg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm truncate">{post.title}</h3>
                  <p className="text-xs text-gray-700">{user.displayName}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-snug overflow-hidden">
                    {post.description}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  {post.mode === "bytte" ? (
                    <Repeat2 className="text-gray-600" size={16} />
                  ) : (
                    <DollarSign className="text-gray-600" size={16} />
                  )}
                </div>
              </div>
              
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeletePost(post);
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Slet opslag"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ---------- GDPR Account Deletion Section ---------- */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">DANGER ZONE: Slet Din Konto</h3>
              <p className="text-sm text-red-700 mb-3">
                I overensstemmelse med GDPR kan du permanent slette din konto og alle tilknyttede data. 
                Dette inkluderer alle dine opslag, beskeder, profil oplysninger og aktivitetshistorik.
              </p>
              <p className="text-xs text-red-600 font-medium">
                Denne handling kan ikke fortrydes og alle dine data vil være permanent tabt.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={confirmDeleteAccount}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium"
        >
          <UserX size={18} />
          <span>Slet Min Konto Permanent</span>
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Du vil få en bekræftelsesdialog før sletning gennemføres
        </p>
      </div>
    </div>
  );
};

export default Profile;
