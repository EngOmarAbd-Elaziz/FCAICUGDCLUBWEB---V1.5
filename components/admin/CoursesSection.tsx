'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

/**
 * Converts any Google Drive / Google Docs share URL into an embeddable /preview URL.
 * Handles Docs, Drive files, Sheets, Slides, and drive.google.com/open?id= links.
 */
function toEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/preview')) return url;

  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([^/?\s]+)/);
  if (docsMatch) return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
  if (driveFileMatch) return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;

  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  if (driveOpenMatch) return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;

  const sheetMatch = url.match(/docs\.google\.com\/(spreadsheets|presentation)\/d\/([^/?\s]+)/);
  if (sheetMatch) return `https://docs.google.com/${sheetMatch[1]}/d/${sheetMatch[2]}/preview`;

  return url;
}

export function CoursesSection() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [tools, setTools] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState('');

  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('courses').select('*').order('display_order', { ascending: true });
    if (data) setItems(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (item: any = null) => {
    setCurrentItem(item);
    setTitle(item?.title || '');
    setLevel(item?.level || '');
    setDuration(item?.duration || '');
    setTools(item?.tools || '');
    setShortDescription(item?.short_description || '');
    setDocUrl(item?.doc_url || '');
    setShowPreview(false);
    setDisplayOrder(item?.display_order || 0);
    setExistingImage(item?.image || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this course?', async () => {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
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
      let imgUrl = existingImage;
      if (imageFile) imgUrl = await uploadFileToSupabase(imageFile, 'club-media');

      const payload = {
        title, level, duration, tools,
        short_description: shortDescription,
        doc_url: docUrl,
        display_order: displayOrder,
        image: imgUrl,
      };

      if (currentItem?.id) {
        const { error } = await supabase.from('courses').update(payload).eq('id', currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([payload]);
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
        <h2>Courses</h2>
        <button className="btn-primary" onClick={() => openModal()}><i className="fas fa-plus"></i> Add Course</button>
      </div>
      <div>
        {items.length === 0 ? <p>No courses found.</p> : items.map(item => (
          <div className="item-card" key={item.id}>
            <div className="item-info">
              <div className="item-title">{item.title}</div>
              <div className="item-subtitle">
                {item.level || ''} {item.duration ? `• ${item.duration}` : ''} {item.tools ? `• ${item.tools}` : ''}
                {item.doc_url && <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '0.8rem' }}><i className="fas fa-file-alt"></i> Doc linked</span>}
                {' '}(Order: {item.display_order})
              </div>
            </div>
            <div className="actions">
              <button className="btn-edit-icon" onClick={() => openModal(item)}><i className="fas fa-edit"></i></button>
              <button className="btn-delete-icon" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem ? 'Edit Course' : 'Add New Course'} onSubmit={handleSubmit} isSaving={isSaving}>
        <div className="form-group"><label>Course Title:</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div className="form-group"><label>Level:</label><input type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="e.g. Beginner, Intermediate, Advanced" /></div>
        <div className="form-group"><label>Duration:</label><input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 8 weeks, 3 months" /></div>
        <div className="form-group"><label>Tools / Technologies:</label><input type="text" value={tools} onChange={e => setTools(e.target.value)} placeholder="e.g. Unity, C#, Blender" /></div>
        <div className="form-group"><label>Short Description:</label><textarea rows={3} value={shortDescription} onChange={e => setShortDescription(e.target.value)}></textarea></div>
        {/* Outline Doc Link */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-file-alt" style={{ color: '#4285f4' }}></i>
            Course Outline (Google Drive / Docs Link):
          </label>
          <input
            type="url"
            value={docUrl}
            onChange={e => { setDocUrl(e.target.value); setShowPreview(false); }}
            placeholder="https://docs.google.com/document/d/... or drive.google.com/file/d/..."
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          {docUrl && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowPreview(p => !p)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: showPreview ? 'rgba(255,255,255,0.1)' : '#4285f4',
                  color: '#fff', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                <i className={`fas fa-${showPreview ? 'eye-slash' : 'eye'}`}></i>
                {showPreview ? 'Hide Preview' : 'Preview Doc'}
              </button>
              <a href={docUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: '#a0aec0', textDecoration: 'underline' }}>
                Open in new tab ↗
              </a>
            </div>
          )}
          {showPreview && docUrl && (
            <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '400px' }}>
              <iframe
                src={toEmbedUrl(docUrl)}
                width="100%"
                height="400"
                style={{ border: 'none', display: 'block' }}
                title="Course Outline Preview"
                allow="autoplay"
              />
            </div>
          )}
        </div>
        <div className="form-group"><label>Display Order:</label><input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 0)} min="0" /></div>
        <div className="form-group">
          <label>Course Image:</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          {existingImage && !imageFile && <div style={{ marginTop: '8px' }}><small>Current:</small><br /><img src={existingImage} style={{ width: '120px', height: 'auto', borderRadius: '4px' }} alt="" /></div>}
        </div>
      </AdminModal>
    </div>
  );
}
