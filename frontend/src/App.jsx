import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ItemsProvider } from "./contexts/ItemsContext";

function AppRoutes() {
  const { user } = useAuth();

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

function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <AppRoutes />
      </ItemsProvider>
    </AuthProvider>
  );
}

export default App;
