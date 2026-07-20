"use client";

import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus({ type: 'success', message: 'Message sent successfully!' });
      setFormData({ name: '', email: '', message: '' }); // clear form
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus({ type: 'error', message: error.message || 'Failed to send message.' });
      } else {
        setStatus({ type: 'error', message: 'Failed to send message.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            name="name"
            placeholder="Your Name" 
            required 
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input 
            type="email" 
            name="email"
            placeholder="Your Email" 
            required 
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <textarea 
            name="message"
            placeholder="Your Message" 
            rows={4} 
            required
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>
        
        {status.type === 'success' && (
          <div style={{ color: '#4ade80', fontSize: '0.9rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '5px' }}></i> {status.message}
          </div>
        )}
        
        {status.type === 'error' && (
          <div style={{ color: '#f87171', fontSize: '0.9rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i> {status.message}
          </div>
        )}

        <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          {!isSubmitting && <i className="fas fa-paper-plane"></i>}
        </button>
      </form>
    </div>
  );
}
