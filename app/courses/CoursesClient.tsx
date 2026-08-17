/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function CoursesClient({ courses }: any) {
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

  return (
    <>
      <section className="courses-section" style={{ padding: '60px 20px', background: 'var(--bg-color)', minHeight: 'calc(100vh - 100px)' }}>
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
