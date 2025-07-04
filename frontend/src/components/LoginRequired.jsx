import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoginRequired = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("loginRequired");

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-medium text-black">
          {t("notLoggedInTitle")}
        </h1>
        <p className="text-base text-black">
          {t("notLoggedInDescription")}
        </p>
        <div className="space-y-3 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="w-full px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            {t("loginButton")}
          </button>
          
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-8 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition-colors"
          >
            {t("signupButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;