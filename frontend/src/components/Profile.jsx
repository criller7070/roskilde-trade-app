import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PlusCircle, Camera, Repeat2, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch items by current user
      const q = query(collection(db, "items"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const itemData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(itemData);
    };

    fetchUserPosts();
  }, [user, navigate]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="pt-20 px-4 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-orange-500 text-center mb-4 flex items-center justify-center gap-2">
        Din Profil <span role="img" aria-label="edit">✏️</span>
      </h1>

      {/* Profile Picture */}
      <div className="relative w-28 h-28 mx-auto mb-4">
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt="profile"
          className="rounded-full w-full h-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
          <Camera size={16} />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-6">
        <p><strong>Navn:</strong> {user.displayName}</p>
        {/* <p><strong>Alder:</strong> 29</p> */}
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Posts */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl text-orange-500 font-bold">Dine Opslag</h2>
        <PlusCircle className="text-orange-500" size={28} />
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Ingen opslag endnu</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex bg-white rounded-xl shadow p-3 gap-3 items-center">
              <img
                src={post.imageUrl || "/placeholder.jpg"}
                alt="item"
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm truncate">{post.name}</h3>
                <p className="text-xs text-gray-700">{user.displayName}</p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-snug overflow-hidden">{post.description}</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                {post.mode === "bytte" ? (
                  <Repeat2 className="text-gray-600" size={16} />
                ) : (
                  <DollarSign className="text-gray-600" size={16} />
                )}
                {post.status === "godkendt" ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
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
