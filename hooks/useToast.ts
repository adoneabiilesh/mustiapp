import { useState, useCallback } from 'react';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastConfig & { visible: boolean } | null>(null);

  const showToast = useCallback((config: ToastConfig) => {
    setToast({
      ...config,
      visible: true,
      type: config.type || 'success',
      duration: config.duration || 2000,
    });

    // Auto hide after duration
    setTimeout(() => {
      setToast((prev) => prev ? { ...prev, visible: false } : null);
      // Clear after animation
      setTimeout(() => {
        setToast(null);
      }, 300);
    }, config.duration || 2000);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => prev ? { ...prev, visible: false } : null);
    setTimeout(() => {
      setToast(null);
    }, 300);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: useCallback((message: string, duration?: number) => {
      showToast({ message, type: 'success', duration });
    }, [showToast]),
    showError: useCallback((message: string, duration?: number) => {
      showToast({ message, type: 'error', duration });
    }, [showToast]),
    showWarning: useCallback((message: string, duration?: number) => {
      showToast({ message, type: 'warning', duration });
    }, [showToast]),
    showInfo: useCallback((message: string, duration?: number) => {
      showToast({ message, type: 'info', duration });
    }, [showToast]),
  };
};

