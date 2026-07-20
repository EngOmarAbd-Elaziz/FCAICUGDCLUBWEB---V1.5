/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function EventsSection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [richContent, setRichContent] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState('');
  
  // Event Partners JSON state
  const [partnersList, setPartnersList] = useState<{ logo_url: string }[]>([]);
  const [isUploadingPartner, setIsUploadingPartner] = useState(false);

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = React.useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from('events').select('*').order('display_order', { ascending: true });
    if (data) setItems(data);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setTitle(item?.title || '');
    setDescription(item?.description || '');
    setRichContent(item?.rich_content || '');
    setPostUrl(item?.post_url || '');
    setDisplayOrder(item?.display_order || 0);
    setExistingCover(item?.cover_image || '');
    setCoverFile(null);
    setPartnersList(item?.partners || []);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this event?', async () => {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        showToast('Deleted successfully!', 'success');
        fetchItems();
      } catch (err: any) {
        showToast(`Failed to delete: ${err.message}`, 'error');
      }
    });
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPartner(true);
    try {
      const logoUrl = await uploadFileToSupabase(file, 'club-media');
      setPartnersList(prev => [...prev, { logo_url: logoUrl }]);
      showToast('Partner logo uploaded!', 'success');
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploadingPartner(false);
      // Reset input element value so same image can be uploaded again
      e.target.value = '';
    }
  };

  const removePartner = (indexToRemove: number) => {
    setPartnersList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let coverUrl = existingCover;
      if (coverFile) coverUrl = await uploadFileToSupabase(coverFile, 'club-media');

      const payload = { 
        title, 
        description, 
        rich_content: richContent, 
        post_url: postUrl,
        display_order: displayOrder, 
        cover_image: coverUrl,
        partners: partnersList
      };

      if (currentItem?.id) {
        const { error } = await supabase.from('events').update(payload).eq('id', currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([payload]);
        if (error) throw error;
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

  if (isLoading) return <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}><i className="fas fa-spinner fa-spin"></i> Loading Section...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Events</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add Event</button>
      </div>
      <div>
        {items.length === 0 ? <p>No events found.</p> : items.map(item => (
          <div className="item-card" key={item.id}>
            <div className="item-info">
              <div className="item-title">{item.title}</div>
              <div className="item-subtitle">{item.description?.substring(0, 80) || 'No description'}... (Order: {item.display_order})</div>
            </div>
            <div className="actions">
              <button className="btn-edit-icon" onClick={() => openModal(item)}><i className="fas fa-edit"></i></button>
              <button className="btn-delete-icon" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? 'Edit Event' : 'Add New Event'} onSubmit={handleSubmit} isSaving={isSaving}>
        <div className="form-group"><label>Event Title:</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="form-group"><label>Short Description:</label><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea></div>
        <div className="form-group"><label>Rich Content (HTML/Markdown):</label><textarea rows={6} value={richContent} onChange={e => setRichContent(e.target.value)} placeholder="Full event details..."></textarea></div>
        <div className="form-group"><label>Original Post Link (URL):</label><input type="url" value={postUrl} onChange={e => setPostUrl(e.target.value)} placeholder="e.g. https://www.linkedin.com/posts/..." /></div>
        <div className="form-group"><label>Display Order:</label><input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} min="0" /></div>
        <div className="form-group">
          <label>Cover Image:</label>
          <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
          {existingCover && !coverFile && <div style={{ marginTop: '8px' }}><small>Current:</small><br /><img src={existingCover} style={{ width: '120px', height: 'auto', borderRadius: '4px' }} alt="" /></div>}
        </div>
        
        {/* Event Partners / Sponsors */}
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Event Partners:</label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            marginBottom: '10px', 
            background: 'var(--bg-color)', 
            padding: '12px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            minHeight: '60px',
            alignItems: 'center'
          }}>
            {partnersList.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#888' }}>No event partners added yet.</span>
            ) : (
              partnersList.map((partner, index) => (
                <div key={index} style={{ position: 'relative', width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                  <img src={partner.logo_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <button
                    type="button"
                    onClick={() => removePartner(index)}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="file"
              id="event-partner-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePartnerLogoUpload}
              disabled={isUploadingPartner}
            />
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => document.getElementById('event-partner-upload')?.click()}
              disabled={isUploadingPartner}
            >
              {isUploadingPartner ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : <><i className="fas fa-plus"></i> Add Partner Logo</>}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
