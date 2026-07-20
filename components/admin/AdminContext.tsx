'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmModalState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

interface AdminContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirmModal: (message: string, onConfirm: () => void) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used within an AdminProvider');
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmModalState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => {
      // Limit to 3 toasts max
      const updated = [...prev, { id, message, type }];
      if (updated.length > 3) updated.shift();
      return updated;
    });

    // Auto remove after 3.7s matching legacy behavior
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3700);
  }, []);

  const showConfirmModal = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      message,
      onConfirm: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
    });
  }, []);

  const closeConfirmModal = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const toastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✔';
      case 'error': return '⚠';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <AdminContext.Provider value={{ showToast, showConfirmModal }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} toast-enter`}>
            <span className="toast-icon">{toastIcon(toast.type)}</span>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      <div className={`modal ${confirmState.isOpen ? 'show' : ''}`} style={{ display: confirmState.isOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <h3 style={{ marginBottom: '2rem' }}>{confirmState.message}</h3>
          <div className="modal-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ background: 'red' }} onClick={confirmState.onConfirm}>Delete</button>
            <button className="btn-secondary" onClick={closeConfirmModal}>Cancel</button>
          </div>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
