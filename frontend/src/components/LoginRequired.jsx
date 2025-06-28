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
        <div className="space-y-3 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="w-full px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Log ind
          </button>
          
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-8 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition-colors"
          >
            Opret bruger
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired; 