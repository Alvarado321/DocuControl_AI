import React, { createContext, useContext, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext({});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#E0F2FE',
        color: '#0E7490',
        border: '1px solid #0891B2',
      },
      ...options,
    });
  };

  const showMLAlert = (message, priority = 'media') => {
    const styles = {
      critica: {
        background: '#FEE2E2',
        color: '#991B1B',
        border: '1px solid #DC2626',
        icon: '🚨',
      },
      alta: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #D97706',
        icon: '⚡',
      },
      media: {
        background: '#E0F2FE',
        color: '#0E7490',
        border: '1px solid #0891B2',
        icon: '🤖',
      },
      baja: {
        background: '#D1FAE5',
        color: '#065F46',
        border: '1px solid #059669',
        icon: '✅',
      },
    };

    const style = styles[priority] || styles.media;

    toast(message, {
      icon: style.icon,
      duration: 5000,
      position: 'top-right',
      style: {
        background: style.background,
        color: style.color,
        border: style.border,
      },
    });
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Mantener solo 100 notificaciones
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Generic showNotification function for backward compatibility
  const showNotification = (message, type = 'info', options = {}) => {
    switch (type) {
      case 'success':
        showSuccess(message, options);
        break;
      case 'error':
        showError(message, options);
        break;
      case 'warning':
        showWarning(message, options);
        break;
      case 'info':
      default:
        showInfo(message, options);
        break;
    }
  };

  const value = {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showMLAlert,
    showNotification, // Add the generic function
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};
