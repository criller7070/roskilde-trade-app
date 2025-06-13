import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AddItem from "./components/AddItem";
import ItemList from "./components/ItemList";
import ChatList from "./components/ChatList";
import ChatPage from "./components/ChatPage";
import About from "./components/About";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Signup from "./components/Signup";
import LoginRequired from "./components/LoginRequired";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <Router>
      <Navbar />
      <div className="pt-16 min-h-screen bg-orange-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/add-item" 
            element={user ? <AddItem /> : <LoginRequired />} 
          />
          <Route path="/items" element={<ItemList />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
