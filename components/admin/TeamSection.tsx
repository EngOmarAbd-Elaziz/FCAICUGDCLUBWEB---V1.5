/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function TeamSection() {
  const [items, setItems] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedSeasonIds, setSelectedSeasonIds] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState('');

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const [membersRes, seasonsRes] = await Promise.all([
      supabase.from('core_team_members').select('*, team_member_seasons(season_id, seasons(name))').order('display_order', { ascending: true }),
      supabase.from('seasons').select('*').order('display_order', { ascending: true }),
    ]);
      
    if (membersRes.data) setItems(membersRes.data);
    if (seasonsRes.data) setSeasons(seasonsRes.data);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setName(item?.name || '');
    setPosition(item?.position || '');
    setLinkedinUrl(item?.linkedin_url || '');
    
    // Fetch associated seasons
    const associatedSeasons = item?.team_member_seasons?.map((tms: any) => tms.season_id) || [];
    setSelectedSeasonIds(associatedSeasons);
    
    setDisplayOrder(item?.display_order || 0);
    setExistingImage(item?.photo || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const toggleSeasonSelection = (seasonId: string) => {
    setSelectedSeasonIds(prev => 
      prev.includes(seasonId) ? prev.filter(id => id !== seasonId) : [...prev, seasonId]
    );
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this team member?', async () => {
      try {
        const { error } = await supabase.from('core_team_members').delete().eq('id', id);
        if (error) throw error;
        showToast('Deleted successfully!', 'success');
        fetchItems();
      } catch (err: any) {
        showToast(`Failed to delete: ${err.message}`, 'error');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let photoUrl = existingImage;
      if (imageFile) {
        photoUrl = await uploadFileToSupabase(imageFile, 'club-media');
      }

      const payload: any = {
        name,
        position,
        linkedin_url: linkedinUrl,
        display_order: displayOrder,
        photo: photoUrl,
      };

      let memberId = currentItem?.id;

      if (memberId) {
        const { error } = await supabase.from('core_team_members').update(payload).eq('id', memberId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('core_team_members').insert([payload]).select('id').single();
        if (error) throw error;
        memberId = data.id;
      }

      // Delete existing relationships
      const { error: delError } = await supabase.from('team_member_seasons').delete().eq('member_id', memberId);
      if (delError) throw delError;

      // Insert new relationships
      if (selectedSeasonIds.length > 0) {
        const junctionData = selectedSeasonIds.map(sId => ({
          member_id: memberId,
          season_id: sId
        }));
        const { error: insError } = await supabase.from('team_member_seasons').insert(junctionData);
        if (insError) throw insError;
      }

      showToast('Saved successfully!', 'success');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}><i className="fas fa-spinner fa-spin"></i> Loading Section...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Core Team Members</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add Team Member</button>
      </div>
      <div id="team-list">
        {items.length === 0 ? (
          <p>No team members found.</p>
        ) : (
          items.map(item => {
            const memberSeasonNames = item.team_member_seasons
              ?.map((tms: any) => tms.seasons?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div className="item-card" key={item.id}>
                <div className="item-info">
                  <div className="item-title">{item.name}</div>
                  <div className="item-subtitle">
                    {item.position || 'No position'}{' '}
                    {memberSeasonNames ? `• Seasons: ${memberSeasonNames}` : '• No Seasons assigned'}{' '}
                    (Order: {item.display_order})
                  </div>
                </div>
                <div className="actions">
                  <button className="btn-edit-icon" onClick={() => openModal(item)}><i className="fas fa-edit"></i></button>
                  <button className="btn-delete-icon" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem ? 'Edit Team Member' : 'Add New Team Member'}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      >
        <div className="form-group">
          <label>Full Name:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Position / Role:</label>
          <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Vice Head, Community Lead" />
        </div>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px' }}>Seasons:</label>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'var(--bg-color)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {seasons.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#888' }}>No seasons created. Add seasons first.</span>
            ) : (
              seasons.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'normal' }}>
                  <input
                    type="checkbox"
                    checked={selectedSeasonIds.includes(s.id)}
                    onChange={() => toggleSeasonSelection(s.id)}
                    style={{ width: 'auto', transform: 'scale(1.15)', cursor: 'pointer' }}
                  />
                  {s.name}
                </label>
              ))
            )}
          </div>
        </div>
        <div className="form-group">
          <label>LinkedIn URL:</label>
          <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Display Order:</label>
          <input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} min="0" />
        </div>
        <div className="form-group">
          <label>Profile Photo:</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          {existingImage && !imageFile && (
            <div style={{ marginTop: '8px' }}>
              <small>Current:</small><br />
              <img src={existingImage} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ff4500' }} alt="" />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
