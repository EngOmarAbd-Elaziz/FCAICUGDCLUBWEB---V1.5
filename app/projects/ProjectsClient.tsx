/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function ProjectsClient({ events, courses, seasons, waves }: any) {
  const [activeSeasonId, setActiveSeasonId] = useState<string>(seasons.length > 0 ? seasons[0].id : '');
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [docModal, setDocModal] = useState<{ title: string; url: string } | null>(null);

  /** Convert any Google Drive/Docs share link to an embeddable /preview URL */
  const toEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('/preview')) return url;
    const docsMatch = url.match(/docs\.google\.com\/document\/d\/([^/?\s]+)/);
    if (docsMatch) return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;
    const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    if (driveFileMatch) return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
    const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    if (driveOpenMatch) return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;
    return url;
  };
  
  const activeWaves = waves.filter((w: any) => w.season_id === activeSeasonId);

  const handleLike = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyLiked = !!likedEvents[eventId];
    setLikedEvents(prev => ({ ...prev, [eventId]: !isCurrentlyLiked }));
    setLocalLikes(prev => ({
      ...prev,
      [eventId]: (prev[eventId] ?? 42) + (isCurrentlyLiked ? -1 : 1)
    }));
  };

  return (
    <>
    <div>
      {/* SECTION 1: Events & Articles */}
      <section className="events-section" style={{ padding: '80px 20px' }}>
        <div className="container">
          <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem', fontWeight: 800 }}>Events & Articles</h2>
          {events && events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
              {events.map((event: any) => {
                const isLiked = !!likedEvents[event.id];
                const likesCount = localLikes[event.id] ?? 42;

                return (
                  <div key={event.id} className="event-card-premium">
                    
                    {/* Left Column: Info & Description */}
                    <div className="event-card-left">
                      <div>
                        <h3 className="event-title-main">{event.title}</h3>
                        <p className="event-desc-main">{event.description}</p>
                      </div>

                      {event.partners && event.partners.length > 0 && (
                        <div className="event-partners-container">
                          <div className="event-partners-title">Event Partners & Sponsors</div>
                          <div className="event-partners-list">
                            {event.partners.map((partner: any, idx: number) => (
                              <div key={idx} className="event-partner-logo" title="Partner / Sponsor">
                                <Image 
                                  src={partner.logo_url} 
                                  alt="Event Partner" 
                                  width={70} 
                                  height={70} 
                                  style={{ objectFit: 'contain', width: '70px', height: '70px' }} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Custom Social Media Post Card or Embed */}
                    <div className="event-card-right">
                      {event.post_url ? (
                        <a 
                          href={event.post_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'block' }}
                        >
                          <div className="social-post-card">
                            {/* Card Header */}
                            <div className="social-post-header">
                              <Image src="/assets/images/omar.webp" alt="Club Logo" width={46} height={46} className="social-post-avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                              <div className="social-post-meta">
                                <div className="social-post-author">
                                  FCAI CU Game Development Club 
                                  <span className="verification-badge" title="Official Community">✔</span>
                                </div>
                                <div className="social-post-subtitle">Official Student Activity • 1d • 🌐</div>
                              </div>
                              <div className="social-post-dots">•••</div>
                            </div>

                            {/* Card Text Preview */}
                            <div className="social-post-text">
                              {event.description?.substring(0, 140)}...
                              <span className="social-post-more">See more</span>
                            </div>

                            {/* Card Main Image */}
                            {event.cover_image && (
                              <div className="social-post-image-container">
                                <Image src={event.cover_image} alt={event.title} width={504} height={284} unoptimized className="social-post-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="social-post-footer">
                              <button className={`social-action-btn ${isLiked ? 'liked' : ''}`} onClick={(e) => handleLike(event.id, e)}>
                                <i className={`fa-heart ${isLiked ? 'fas' : 'far'}`}></i>
                                <span>{likesCount} Likes</span>
                              </button>
                              <div className="social-action-btn">
                                <i className="far fa-comment"></i>
                                <span>Comment</span>
                              </div>
                              <div className="social-action-btn">
                                <i className="far fa-paper-plane"></i>
                                <span>Share</span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ) : event.rich_content ? (
                        <div className="event-embed-wrapper" dangerouslySetInnerHTML={{ __html: event.rich_content }} />
                      ) : event.cover_image ? (
                        <div className="event-cover-wrapper">
                          <Image src={event.cover_image} alt={event.title} width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="event-placeholder-wrapper">
                          <i className="fas fa-calendar-alt" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.05)' }}></i>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>No events found.</p>
          )}
        </div>
      </section>

      {/* SECTION 2: Courses */}
      <section className="courses-section" style={{ padding: '60px 20px', background: 'var(--bg-color)' }}>
        <div className="container">
          <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '3rem' }}>Courses</h2>
          {courses && courses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {courses.map((course: any) => (
                <div key={course.id} style={{ display: 'flex', gap: '2rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {course.image && (
                    <Image src={course.image} alt={course.title} width={300} height={200} style={{ borderRadius: '10px', objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3>{course.title}</h3>
                    <p style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>Level: {course.level} | Duration: {course.duration}</p>
                    <p style={{ marginBottom: '1rem' }}>Tools: {course.tools}</p>
                    <p>{course.short_description}</p>
                    {course.doc_url && (
                      <button
                        onClick={() => setDocModal({ title: course.title, url: course.doc_url })}
                        className="btn-primary"
                        style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
                      >
                        <i className="fas fa-file-alt"></i>
                        View Outline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>No courses found.</p>
          )}
        </div>
      </section>

      {/* SECTION 3: Waves */}
      <section className="waves-section" style={{ padding: '60px 20px' }}>
        <div className="container">
          <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '3rem' }}>Waves</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {seasons.map((season: any) => (
              <button
                key={season.id}
                onClick={() => setActiveSeasonId(season.id)}
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeSeasonId === season.id 
                    ? 'linear-gradient(135deg, var(--secondary-color), var(--accent-color))'
                    : 'var(--card-bg)',
                  color: activeSeasonId === season.id ? 'var(--text-color)' : 'var(--text-color)'
                }}
              >
                {season.name}
              </button>
            ))}
          </div>

          {activeWaves && activeWaves.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {activeWaves.map((wave: any) => (
                <div key={wave.id} style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '14px' }}>
                  {wave.banner && (
                    <Image src={wave.banner} alt={wave.name} width={1200} height={300} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1.5rem' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ fontSize: '2rem', color: 'var(--secondary-color)', margin: 0 }}>{wave.name}</h3>
                    {wave.jam_url && (
                      <a href={wave.jam_url} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-gamepad"></i> Wave Games
                      </a>
                    )}
                  </div>
                  <p style={{ marginBottom: '2rem' }}>{wave.description}</p>

                  <div style={{ width: '100%' }}>
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Top Members</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
                      {wave.wave_top_members && [...wave.wave_top_members].sort((a: any, b: any) => a.display_order - b.display_order).map((member: any) => (
                        <div className="team-card" key={member.id} style={{ width: '180px', height: '220px' }}>
                          <Image src={member.image || 'https://via.placeholder.com/200'} alt={member.name} width={200} height={220} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                          <div className="overlay" style={{ padding: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{member.name}</h3>
                            {member.rank && <p style={{ fontSize: '0.85rem', marginBottom: 0, color: 'var(--accent-color)' }}>{member.rank}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>No waves found for this season.</p>
          )}
        </div>
      </section>
    </div>

    {/* ── Google Drive Doc Viewer Modal ── */}
    {docModal && (
      <div
        onClick={() => setDocModal(null)}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '900px', height: '90vh',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-file-alt" style={{ color: '#4285f4', fontSize: '1.2rem' }}></i>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{docModal?.title} — Outline</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <a href={docModal?.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: '#a0aec0', textDecoration: 'underline' }}>
                Open in new tab ↗
              </a>
              <button
                onClick={() => setDocModal(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: 'var(--text-color)', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <iframe
            src={toEmbedUrl(docModal?.url ?? '')}
            style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
            title={`${docModal?.title} Outline`}
            allow="autoplay"
          />
        </div>
      </div>
    )}
    </>
  );
}
