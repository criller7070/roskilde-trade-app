import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc as fsDoc,
  updateDoc,
} from "firebase/firestore";
import { PlusCircle, Camera, Repeat2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Profile = () => {
  const { user } = useAuth();
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
      setPosts(itemData);
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

  if (!user) return null;

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4 flex items-center justify-center gap-2">
        Din Profil
      </h1>

      {/* ---------- profile picture block ---------- */}
      <div className="relative w-28 h-28 mx-auto mb-4">
        <LoadingPlaceholder
          src={preview || user.photoURL || "/default_pfp.jpg"}
          alt="avatar"
          className="rounded-full w-full h-full object-cover"
          placeholderClassName="rounded-full"
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
              onClick={() => navigate(`/item/${post.id}`)}
              className="flex bg-white rounded-xl shadow p-3 gap-3 items-center"
            >
              <LoadingPlaceholder
                src={post.imageUrl || "/placeholder.jpg"}
                alt="item"
                className="w-16 h-16 object-cover rounded-md"
                placeholderClassName="rounded-md"
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
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
