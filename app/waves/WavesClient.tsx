/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function WavesClient({ seasons, waves }: any) {
  const [activeSeasonId, setActiveSeasonId] = useState<string>(seasons.length > 0 ? seasons[0].id : '');
  
  const activeWaves = waves.filter((w: any) => w.season_id === activeSeasonId);

  return (
    <section className="waves-section" style={{ padding: '60px 20px', minHeight: 'calc(100vh - 100px)' }}>
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
  );
}
