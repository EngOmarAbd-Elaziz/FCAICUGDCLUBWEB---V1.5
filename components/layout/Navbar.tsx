'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  // Check auth state on mount and across pages
  useEffect(() => {

    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    };

    checkAdminStatus();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Double-click on logo triggers admin modal
  const handleLogoDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setShowAdminModal(true);
    }
  }, [isAdmin]);

  // Mobile double-tap support
  const lastTapRef = React.useRef(0);
  const handleLogoTouchEnd = useCallback((e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapDelay = currentTime - lastTapRef.current;
    if (tapDelay < 300 && tapDelay > 0) {
      e.preventDefault();
      if (!isAdmin) {
        setShowAdminModal(true);
      }
    }
    lastTapRef.current = currentTime;
  }, [isAdmin]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoginError(error.message);
        setLoginLoading(false);
        return;
      }

      setIsAdmin(true);
      setShowAdminModal(false);
      setEmail('');
      setPassword('');
      router.refresh();
    } catch {
      setLoginError('Network error during sign in');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAdmin(false);
    router.refresh();
  }

  function closeModal() {
    setShowAdminModal(false);
    setLoginError('');
    setEmail('');
    setPassword('');
  }

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link 
            href="/" 
            className="nav-logo" 
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            onDoubleClick={handleLogoDoubleClick}
            onTouchEnd={handleLogoTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/omar.webp" alt="Logo" loading="lazy" />
            <span className="logo-text">Game Development Club</span>
          </Link>
          
          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/team" onClick={() => setMobileMenuOpen(false)}>Team</Link>
            <Link href="/projects" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            
            {isAdmin && (
              <>
                <Link href="/admin" className="admin-link" title="Admin Dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ff4500', fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-crown"></i>
                </Link>
                <button className="logout-btn" title="Logout" onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            )}
          </div>
          
          <button 
            id="hamburger" 
            className="hamburger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Admin Login Modal - triggered by double-click on logo */}
      {showAdminModal && (
        <div 
          className="modal show" 
          id="admin-login-modal" 
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
        >
          <div className="modal-content" style={{ maxWidth: '400px', background: 'var(--card-bg)', backdropFilter: 'blur(12px)', padding: '2.5rem', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center', position: 'relative' }}>
            <span onClick={closeModal} className="close" style={{ position: 'absolute', top: '15px', right: '20px', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-color)' }}>&times;</span>
            
            <div style={{ fontSize: '3.5rem', color: 'var(--primary-color)', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(255, 69, 0, 0.35))' }}>
              <i className="fas fa-user-shield"></i>
            </div>
            
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 700 }}>Admin Sign In</h3>
            
            {loginError && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{loginError}</p>}
            
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label htmlFor="admin-email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                <input 
                  type="email" 
                  id="admin-email" 
                  required 
                  placeholder="admin@admin.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem' }}
                />
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label htmlFor="admin-password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <input 
                  type="password" 
                  id="admin-password" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loginLoading} style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {loginLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Signing In...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
