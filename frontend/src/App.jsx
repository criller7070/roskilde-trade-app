import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AddItem from "./components/AddItem";
import ItemList from "./components/ItemList";
import ChatList from "./components/ChatList";
import ChatPage from "./components/ChatPage";
import About from "./components/About";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-16 min-h-screen bg-orange-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/items" element={<ItemList />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
