'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Season {
  id: string;
  name: string;
  display_order: number;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  linkedin_url: string;
  photo: string;
  display_order: number;
  team_member_seasons: { season_id: string }[];
}

export default function TeamClient({ seasons, teamMembers }: { seasons: Season[], teamMembers: TeamMember[] }) {
  // Sort seasons by name descending to get the latest one (e.g., "Season 2026" comes before "Season 2024")
  const latestSeasonId = seasons.length > 0 
    ? [...seasons].sort((a, b) => b.name.localeCompare(a.name))[0].id 
    : '';
    
  const [activeSeasonId, setActiveSeasonId] = useState<string>(latestSeasonId);

  const activeMembers = teamMembers.filter(member => 
    member.team_member_seasons?.some(tms => tms.season_id === activeSeasonId)
  );

  return (
    <div>
      {/* Season Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {[...seasons].sort((a, b) => b.name.localeCompare(a.name)).map(season => (
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

      {/* Team Grid */}
      <div className="team-grid">
        {activeMembers.length > 0 ? (
          activeMembers.map(member => (
            <div className="team-card" key={member.id}>
              {member.photo ? (
                <Image src={member.photo} alt={member.name} width={400} height={500} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <div style={{ width: '100%', height: '300px', background: '#333' }} />
              )}
              <div className="overlay">
                <h3>{member.name}</h3>
                <p>{member.position}</p>
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" rel="noreferrer">
                    <i className="fab fa-linkedin"></i>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No team members found for this season.</p>
        )}
      </div>
    </div>
  );
}
