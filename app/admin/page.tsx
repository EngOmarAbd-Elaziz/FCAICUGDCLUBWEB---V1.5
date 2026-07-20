'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminProvider } from '@/components/admin/AdminContext';
import Image from 'next/image';

// Section Imports
import { StatisticsSection } from '@/components/admin/StatisticsSection';
import { SiteSettingsSection } from '@/components/admin/SiteSettingsSection';
import { FoundersSection } from '@/components/admin/FoundersSection';
import { SeasonsSection } from '@/components/admin/SeasonsSection';
import { TeamSection } from '@/components/admin/TeamSection';
import { EventsSection } from '@/components/admin/EventsSection';
import { CoursesSection } from '@/components/admin/CoursesSection';
import { WavesSection } from '@/components/admin/WavesSection';
import { YouTubeSection } from '@/components/admin/YouTubeSection';
import { PartnersSection } from '@/components/admin/PartnersSection';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('statistics');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role !== 'admin') {
        router.replace('/');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();

    // Hide top navbar and reset body padding for admin page
    document.body.classList.add('admin-page');
    document.body.style.paddingTop = '0';
    return () => {
      document.body.classList.remove('admin-page');
      document.body.style.paddingTop = '';
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const switchSection = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color, #0a0a0a)', color: 'var(--text-color, #fff)' }}>
        <div style={{ fontSize: '2rem' }}>
          <i className="fas fa-spinner fa-spin"></i> Loading Admin...
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'statistics': return <StatisticsSection />;
      case 'site-settings': return <SiteSettingsSection />;
      case 'founders': return <FoundersSection />;
      case 'team-seasons': return <SeasonsSection />;
      case 'team': return <TeamSection />;
      case 'events': return <EventsSection />;
      case 'courses': return <CoursesSection />;
      case 'waves': return <WavesSection />;
      case 'youtube': return <YouTubeSection />;
      case 'partners': return <PartnersSection />;
      default: return <StatisticsSection />;
    }
  };

  const sidebarLinks = [
    { group: 'Core', items: [
      { key: 'statistics', icon: 'fas fa-chart-bar', label: 'Statistics' },
      { key: 'site-settings', icon: 'fas fa-cog', label: 'Site Settings' },
    ]},
    { group: 'People', items: [
      { key: 'founders', icon: 'fas fa-user-tie', label: 'Founders' },
      { key: 'team-seasons', icon: 'fas fa-calendar-alt', label: 'Team Seasons' },
      { key: 'team', icon: 'fas fa-users', label: 'Core Team' },
    ]},
    { group: 'Activities', items: [
      { key: 'events', icon: 'fas fa-calendar-check', label: 'Events' },
      { key: 'courses', icon: 'fas fa-book-open', label: 'Courses' },
      { key: 'waves', icon: 'fas fa-graduation-cap', label: 'Student Waves' },
    ]},
    { group: 'Media & Content', items: [
      { key: 'youtube', icon: 'fab fa-youtube', label: 'YouTube Videos' },
    ]},
    { group: 'External', items: [
      { key: 'partners', icon: 'fas fa-handshake', label: 'Partners' },
    ]},
  ];

  return (
    <AdminProvider>
      {/* Full-screen admin shell, no top navbar */}
      <div style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--bg-color, #0a0a0a)', overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} id="admin-sidebar"
          style={{ width: 230, minWidth: 230, height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div className="sidebar-header">
            <Image src="/assets/images/omar.webp" alt="Logo" width={36} height={36}
                 style={{ objectFit: 'contain', borderRadius: 0, border: 'none' }} />
            <span>Admin Panel</span>
          </div>
          
          <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1 }}>
            {sidebarLinks.map(group => (
              <React.Fragment key={group.group}>
                <div style={{ padding: '10px 15px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '10px', letterSpacing: '0.05em' }}>
                  {group.group}
                </div>
                {group.items.map(item => (
                  <a
                    key={item.key}
                    href="#"
                    className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); switchSection(item.key); }}
                  >
                    <i className={item.icon}></i> {item.label}
                  </a>
                ))}
              </React.Fragment>
            ))}
          </nav>
          
          <div className="sidebar-footer">
            <a href="/" className="sidebar-link" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-external-link-alt"></i> View Website
            </a>
            <button
              className="sidebar-link logout-btn"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </aside>

        {/* Main Content — scrollable, fills all remaining space */}
        <main
          id="admin-main"
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {renderSection()}

          {/* Developer signature watermark */}
          <div style={{
            position: 'fixed',
            bottom: '14px',
            right: '20px',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
            letterSpacing: '0.04em',
            userSelect: 'none',
            fontFamily: 'monospace',
          }}>
            Developed by Eng.Omar Abdelaziz
          </div>
        </main>
      </div>
    </AdminProvider>
  );
}
