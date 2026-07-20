'use client';

import React, { ReactNode, useEffect } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  children: ReactNode;
}

export function AdminModal({ isOpen, onClose, title, onSubmit, isSaving, children }: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal show" style={{ display: 'flex' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <form onSubmit={onSubmit}>
          <h3>{title}</h3>
          <div id="form-fields">
            {children}
          </div>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <><i className="fas fa-spinner fa-spin"></i> Saving...</>
            ) : (
              'Save'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
