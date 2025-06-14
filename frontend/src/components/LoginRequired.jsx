import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-medium text-black">
          Du er ikke logget ind...
        </h1>
        <p className="text-base text-black">
          Du skal logge ind for at oprette opslag og bytte
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Log ind
        </button>
      </div>
    </div>
  );
};

export default LoginRequired; 