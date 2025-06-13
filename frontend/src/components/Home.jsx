import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
      <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center text-center px-6 pb-6 pt-4">
        <h1 className="text-4xl font-bold text-orange-600">Welcome to RosSwap</h1>
        <p className="text-lg text-gray-700 mt-4">
          Trade items, food, and more with other festival guests to reduce waste and make new friends!
        </p>
        <button
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600"
          onClick={() => navigate("/items")}
        >
          Start Trading
        </button>
      </div>
    );
};

export default Home;
