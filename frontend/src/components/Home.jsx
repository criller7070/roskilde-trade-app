const Home = () => {
    return (
      <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-orange-600">Welcome to Roskilde Trade</h1>
        <p className="text-lg text-gray-700 mt-4">
          Trade items, food, and more with other festival guests to reduce waste and make new friends!
        </p>
        <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600">
          Start Trading
        </button>
      </div>
    );
  };
  
  export default Home;
  