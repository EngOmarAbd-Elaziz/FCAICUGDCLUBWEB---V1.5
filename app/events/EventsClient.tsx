/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function EventsClient({ seasons = [], events = [] }: any) {
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  
  // Default to the first season if available
  const [activeSeasonId, setActiveSeasonId] = useState<string>(
    seasons.length > 0 ? seasons[0].id : ''
  );

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

  const activeEvents = seasons.length > 0
    ? events.filter((e: any) => e.season_id === activeSeasonId)
    : events;

  return (
    <section className="events-section" style={{ padding: '80px 20px', minHeight: 'calc(100vh - 100px)' }}>
      <div className="container">
        <h2 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.5rem', fontWeight: 800 }}>Events & Articles</h2>

        {/* Seasons Category / Filter Tabs */}
        {seasons && seasons.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
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
                  color: 'var(--text-color)'
                }}
              >
                {season.name}
              </button>
            ))}
          </div>
        )}

        {activeEvents && activeEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {activeEvents.map((event: any) => {
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
          <p style={{ textAlign: 'center' }}>No events found for this season.</p>
        )}
      </div>
    </section>
  );
}
