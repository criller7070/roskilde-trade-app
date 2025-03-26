import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AddItem from "./components/AddItem";
import ItemList from "./components/ItemList";
import ChatList from "./components/ChatList";
import ChatPage from "./components/ChatPage"; // ✅ Import ChatPage

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<ChatPage />} /> {/* ✅ Add this */}
      </Routes>
    </Router>
  );
}

export default App;
