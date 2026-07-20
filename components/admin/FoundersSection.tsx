'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function FoundersSection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState('');

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('founders').select('*').order('display_order', { ascending: true });
    if (data) setItems(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setName(item?.name || '');
    setRole(item?.role || '');
    setLinkedinUrl(item?.linkedin_url || '');
    setDisplayOrder(item?.display_order || 0);
    setExistingPhoto(item?.photo || '');
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this founder?', async () => {
      try {
        const { error } = await supabase.from('founders').delete().eq('id', id);
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
      let photoUrl = existingPhoto;
      if (photoFile) photoUrl = await uploadFileToSupabase(photoFile, 'club-media');

      const payload = { name, role, linkedin_url: linkedinUrl, display_order: displayOrder, photo: photoUrl };

      if (currentItem?.id) {
        const { error } = await supabase.from('founders').update(payload).eq('id', currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('founders').insert([payload]);
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
        <h2>Founders</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add Founder</button>
      </div>
      <div>
        {items.length === 0 ? <p>No founders found.</p> : items.map(item => (
          <div className="item-card" key={item.id}>
            <div className="item-info">
              <div className="item-title">{item.name}</div>
              <div className="item-subtitle">{item.role || 'No role'} (Order: {item.display_order})</div>
            </div>
            <div className="actions">
              <button className="btn-edit-icon" onClick={() => openModal(item)}><i className="fas fa-edit"></i></button>
              <button className="btn-delete-icon" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? 'Edit Founder' : 'Add New Founder'} onSubmit={handleSubmit} isSaving={isSaving}>
        <div className="form-group"><label>Name:</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Role / Title:</label><input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Co-Founder, Lead" /></div>
        <div className="form-group"><label>LinkedIn URL:</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} /></div>
        <div className="form-group"><label>Display Order:</label><input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} min="0" /></div>
        <div className="form-group">
          <label>Photo:</label>
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
          {existingPhoto && !photoFile && <div style={{ marginTop: '8px' }}><small>Current:</small><br /><img src={existingPhoto} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt="" /></div>}
        </div>
      </AdminModal>
    </div>
  );
}
