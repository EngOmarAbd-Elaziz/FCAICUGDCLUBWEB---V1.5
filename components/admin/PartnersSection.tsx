'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function PartnersSection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogo, setExistingLogo] = useState('');

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (data) setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setName(item?.name || '');
    setWebsiteUrl(item?.website_url || '');
    setDisplayOrder(item?.display_order || 0);
    setExistingLogo(item?.logo_url || '');
    setLogoFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this partner?', async () => {
      try {
        const { error } = await supabase.from('partners').delete().eq('id', id);
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
      let logoUrl = existingLogo;
      if (logoFile) {
        logoUrl = await uploadFileToSupabase(logoFile, 'club-media');
      }

      const payload = {
        name,
        website_url: websiteUrl,
        display_order: displayOrder,
        logo_url: logoUrl,
      };

      if (currentItem?.id) {
        const { error } = await supabase.from('partners').update(payload).eq('id', currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('partners').insert([payload]);
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

  if (isLoading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}><i className="fas fa-spinner fa-spin"></i> Loading Section...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Our Partners</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add Partner</button>
      </div>
      <div id="partners-list">
        {items.length === 0 ? (
          <p>No partners found.</p>
        ) : (
          items.map(item => (
            <div className="item-card" key={item.id}>
              <div className="item-info">
                <div className="item-title">{item.name}</div>
                <div className="item-subtitle">{item.website_url || 'No URL'} (Order: {item.display_order})</div>
              </div>
              <div className="actions">
                <button className="btn-edit-icon" onClick={() => openModal(item)}><i className="fas fa-edit"></i></button>
                <button className="btn-delete-icon" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem ? 'Edit Partner' : 'Add New Partner'}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      >
        <div className="form-group">
          <label>Partner Name:</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Website URL:</label>
          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="e.g. https://partner-website.com" />
        </div>
        <div className="form-group">
          <label>Display Order:</label>
          <input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} min="0" />
        </div>
        <div className="form-group">
          <label>Logo Image File:</label>
          <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
          {existingLogo && !logoFile && (
            <div style={{ marginTop: '8px' }}>
              <small>Current Logo:</small><br />
              <img src={existingLogo} style={{ width: '80px', height: 'auto', border: '1px solid rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px' }} />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
