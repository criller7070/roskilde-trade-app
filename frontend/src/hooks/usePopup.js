import { useState, useCallback } from 'react';

export const usePopup = () => {
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showPopup = useCallback((config) => {
    setPopup({
      isOpen: true,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      onConfirm: null,
      ...config
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods
  const showAlert = useCallback((message, title = 'Notice') => {
    showPopup({ title, message, type: 'info' });
  }, [showPopup]);

  const showSuccess = useCallback((message, title = 'Success') => {
    showPopup({ title, message, type: 'success' });
  }, [showPopup]);

  const showError = useCallback((message, title = 'Error') => {
    showPopup({ title, message, type: 'error' });
  }, [showPopup]);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm', confirmText = 'OK', cancelText = 'Cancel') => {
    showPopup({
      title,
      message,
      type: 'info',
      onConfirm,
      confirmText,
      cancelText,
      showCancel: true
    });
  }, [showPopup]);

  return {
    popup,
    showPopup,
    hidePopup,
    showAlert,
    showSuccess,
    showError,
    showConfirm
  };
}; 