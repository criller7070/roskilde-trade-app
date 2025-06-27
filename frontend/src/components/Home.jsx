import { useNavigate } from "react-router-dom";
import LoadingPlaceholder from "./LoadingPlaceholder";

const Home = () => {
    const navigate = useNavigate();

    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-6 -mt-16 overflow-hidden">
        <LoadingPlaceholder
          src="/logo.png"
          alt="RosSwap Logo"
          className="w-32 h-40 mb-4 object-contain mx-auto"
          placeholderClassName="bg-orange-200 rounded-lg"
        />
        <h1 className="text-3xl font-bold text-orange-600">Velkommen til RosSwap</h1>
        <p className="text-base text-gray-700 mt-3 px-2">
          Byt ting, mad og meget mere med andre festivalgæster for at reducere spild og skabe nye venskaber!
        </p>
        <button
          className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600"
          onClick={() => navigate("/swipe")}
        >
          Swipe Opslag!
        </button>
        <button
          className="mt-3 px-6 py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600"
          onClick={() => navigate("/items")}
        >
          Se Nye Opslag
        </button>
      </div>
    );
};

export default Home;
