'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function YouTubeSection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState('');

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('id', { ascending: false });
      
    if (data) setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setTitle(item?.title || '');
    setYoutubeUrl(item?.youtube_url || '');
    setExistingThumbnail(item?.thumbnail || '');
    setThumbnailFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this video?', async () => {
      try {
        const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
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
      let thumbUrl = existingThumbnail;
      if (thumbnailFile) {
        thumbUrl = await uploadFileToSupabase(thumbnailFile, 'club-media');
      }

      const payload = {
        title,
        youtube_url: youtubeUrl,
        thumbnail: thumbUrl,
      };

      if (currentItem?.id) {
        const { error } = await supabase.from('youtube_videos').update(payload).eq('id', currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('youtube_videos').insert([payload]);
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
        <h2>YouTube Videos</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add YouTube Video</button>
      </div>
      <div id="youtube-list">
        {items.length === 0 ? (
          <p>No YouTube videos found.</p>
        ) : (
          items.map(item => (
            <div className="item-card" key={item.id}>
              <div className="item-info">
                <div className="item-title">{item.title}</div>
                <div className="item-subtitle">{item.youtube_url}</div>
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
        title={currentItem ? 'Edit YouTube Video' : 'Add New YouTube Video'}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      >
        <div className="form-group">
          <label>Video Title:</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>YouTube URL:</label>
          <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} required placeholder="e.g. https://www.youtube.com/watch?v=XXXXXX" />
        </div>
        <div className="form-group">
          <label>Thumbnail Image File:</label>
          <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
          {existingThumbnail && !thumbnailFile && (
            <div style={{ marginTop: '8px' }}>
              <small>Current:</small><br />
              <img src={existingThumbnail} style={{ width: '80px', height: 'auto', borderRadius: '4px' }} />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
