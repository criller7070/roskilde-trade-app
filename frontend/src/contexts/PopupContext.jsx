import React, { createContext, useContext } from 'react';
import { usePopup } from '../hooks/usePopup';
import Popup from '../components/Popup';

const PopupContext = createContext();

export const usePopupContext = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopupContext must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider = ({ children }) => {
  const popupUtils = usePopup();

  return (
    <PopupContext.Provider value={popupUtils}>
      {children}
      <Popup
        isOpen={popupUtils.popup.isOpen}
        onClose={popupUtils.hidePopup}
        title={popupUtils.popup.title}
        message={popupUtils.popup.message}
        type={popupUtils.popup.type}
        onConfirm={popupUtils.popup.onConfirm}
        confirmText={popupUtils.popup.confirmText}
        cancelText={popupUtils.popup.cancelText}
        showCancel={popupUtils.popup.showCancel}
      />
    </PopupContext.Provider>
  );
}; 