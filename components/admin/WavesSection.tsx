'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';
import { AdminModal } from './AdminModal';
import { uploadFileToSupabase } from './uploadHelper';

export function WavesSection() {
  const [waves, setWaves] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWavePanel, setActiveWavePanel] = useState<string | null>(null);
  const [activePanelType, setActivePanelType] = useState<'members'>('members');
  
  // Wave Modal State
  const [isWaveModalOpen, setIsWaveModalOpen] = useState(false);
  const [isSavingWave, setIsSavingWave] = useState(false);
  const [currentWave, setCurrentWave] = useState<any>(null);
  const [waveName, setWaveName] = useState('');
  const [waveDesc, setWaveDesc] = useState('');
  const [waveOrder, setWaveOrder] = useState<number>(0);
  const [waveSeasonId, setWaveSeasonId] = useState('');
  const [waveBannerFile, setWaveBannerFile] = useState<File | null>(null);
  const [waveExistingBanner, setWaveExistingBanner] = useState('');
  const [waveJamUrl, setWaveJamUrl] = useState('');

  // Top Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [targetWaveId, setTargetWaveId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRank, setMemberRank] = useState('');
  const [memberOrder, setMemberOrder] = useState<number>(0);
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberExistingImage, setMemberExistingImage] = useState('');



  const supabase = createClient();
  const { showToast, showConfirmModal } = useAdminContext();

  const fetchItems = async () => {
    setIsLoading(true);
    const [wavesRes, seasonsRes] = await Promise.all([
      supabase.from('waves').select('*, wave_top_members(*), seasons(name)').order('display_order', { ascending: true }),
      supabase.from('seasons').select('*').order('display_order', { ascending: true }),
    ]);

    if (wavesRes.data) setWaves(wavesRes.data);
    if (seasonsRes.data) setSeasons(seasonsRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleWavePanel = (waveId: string, type: 'members') => {
    if (activeWavePanel === waveId && activePanelType === type) {
      setActiveWavePanel(null);
    } else {
      setActiveWavePanel(waveId);
      setActivePanelType(type);
    }
  };

  // ===== Wave CRUD =====
  const openWaveModal = (wave: any = null) => {
    setCurrentWave(wave);
    setWaveName(wave?.name || '');
    setWaveDesc(wave?.description || '');
    setWaveOrder(wave?.display_order || 0);
    setWaveSeasonId(wave?.season_id || '');
    setWaveExistingBanner(wave?.banner || '');
    setWaveJamUrl(wave?.jam_url || '');
    setWaveBannerFile(null);
    setIsWaveModalOpen(true);
  };

  const handleWaveDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this wave? All its members and games will also be deleted.', async () => {
      try {
        const { error } = await supabase.from('waves').delete().eq('id', id);
        if (error) throw error;
        showToast('Deleted successfully!', 'success');
        fetchItems();
      } catch (err: any) {
        showToast(`Failed to delete: ${err.message}`, 'error');
      }
    });
  };

  const handleWaveSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingWave(true);
    try {
      let bannerUrl = waveExistingBanner;
      if (waveBannerFile) {
        bannerUrl = await uploadFileToSupabase(waveBannerFile, 'club-media');
      }
      const payload: any = {
        name: waveName,
        description: waveDesc,
        display_order: waveOrder,
        banner: bannerUrl,
        jam_url: waveJamUrl,
      };
      if (waveSeasonId) payload.season_id = waveSeasonId;

      if (currentWave?.id) {
        const { error } = await supabase.from('waves').update(payload).eq('id', currentWave.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('waves').insert([payload]);
        if (error) throw error;
      }
      showToast('Wave saved successfully!', 'success');
      setIsWaveModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setIsSavingWave(false);
    }
  };

  // ===== Top Member CRUD =====
  const openMemberModal = (waveId: string, member: any = null) => {
    setTargetWaveId(waveId);
    setCurrentMember(member);
    setMemberName(member?.name || '');
    setMemberRank(member?.rank || '');
    setMemberOrder(member?.display_order || 0);
    setMemberExistingImage(member?.image || '');
    setMemberImageFile(null);
    setIsMemberModalOpen(true);
  };

  const handleMemberDelete = (id: string) => {
    showConfirmModal('Are you sure you want to delete this top member?', async () => {
      try {
        const { error } = await supabase.from('wave_top_members').delete().eq('id', id);
        if (error) throw error;
        showToast('Deleted successfully!', 'success');
        fetchItems();
      } catch (err: any) {
        showToast(`Failed to delete: ${err.message}`, 'error');
      }
    });
  };

  const handleMemberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingMember(true);
    try {
      let imageUrl = memberExistingImage;
      if (memberImageFile) {
        imageUrl = await uploadFileToSupabase(memberImageFile, 'club-media');
      }
      const payload = {
        wave_id: targetWaveId,
        name: memberName,
        rank: memberRank,
        image: imageUrl,
        display_order: memberOrder,
      };
      if (currentMember?.id) {
        const { error } = await supabase.from('wave_top_members').update(payload).eq('id', currentMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('wave_top_members').insert([payload]);
        if (error) throw error;
      }
      showToast('Top member saved successfully!', 'success');
      setIsMemberModalOpen(false);
      fetchItems();
    } catch (err: any) {
      showToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setIsSavingMember(false);
    }
  };



  if (isLoading) {
    return <div className="loading-spinner" style={{ textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}><i className="fas fa-spinner fa-spin"></i> Loading Section...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Student Waves</h2>
        <button className="btn-primary" onClick={() => openWaveModal()}><i className="fas fa-plus"></i> Add Wave</button>
      </div>
      <div id="waves-list">
        {waves.length === 0 ? (
          <p>No waves found.</p>
        ) : (
          waves.map(wave => (
            <div className="item-card-wrapper" style={{ marginBottom: '1.5rem' }} key={wave.id}>
              <div className="item-card" style={{ marginBottom: 0 }}>
                <div className="item-info">
                  <div className="item-title">{wave.name}</div>
                  <div className="item-subtitle">{wave.seasons?.name ? `Season: ${wave.seasons.name} | ` : ''}{wave.description || 'No description'} (Order: {wave.display_order})</div>
                </div>
                <div className="actions">
                  <button className="btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }} onClick={() => toggleWavePanel(wave.id, 'members')}>
                    <i className="fas fa-users"></i> Top Members ({wave.wave_top_members?.length || 0})
                  </button>
                  <button className="btn-edit-icon" onClick={() => openWaveModal(wave)}><i className="fas fa-edit"></i></button>
                  <button className="btn-delete-icon" onClick={() => handleWaveDelete(wave.id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>

              {/* Top Members Panel */}
              <div className={`wave-projects-panel ${activeWavePanel === wave.id && activePanelType === 'members' ? 'active' : ''}`}>
                <div className="wave-projects-header">
                  <h4>Top Members - {wave.name}</h4>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openMemberModal(wave.id)}>
                    <i className="fas fa-plus"></i> Add Top Member
                  </button>
                </div>
                <div className="nested-projects-list">
                  {wave.wave_top_members && wave.wave_top_members.length > 0 ? (
                    wave.wave_top_members.sort((a: any, b: any) => a.display_order - b.display_order).map((m: any) => (
                      <div className="nested-project-card" key={m.id}>
                        <div>
                          <strong>{m.name}</strong>
                          {m.rank && <span style={{ opacity: 0.6, fontSize: '0.8rem' }}> - {m.rank}</span>}
                        </div>
                        <div className="actions">
                          <button className="btn-edit-icon" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }} onClick={() => openMemberModal(wave.id, m)}><i className="fas fa-edit"></i></button>
                          <button className="btn-delete-icon" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }} onClick={() => handleMemberDelete(m.id)}><i className="fas fa-trash"></i></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No top members added yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Wave Modal */}
      <AdminModal isOpen={isWaveModalOpen} onClose={() => setIsWaveModalOpen(false)} title={currentWave ? 'Edit Wave' : 'Add New Wave'} onSubmit={handleWaveSubmit} isSaving={isSavingWave}>
        <div className="form-group">
          <label>Wave Name:</label>
          <input type="text" value={waveName} onChange={e => setWaveName(e.target.value)} required placeholder="e.g. Game Development (Unreal Engine)" />
        </div>
        <div className="form-group">
          <label>Season:</label>
          <select value={waveSeasonId} onChange={e => setWaveSeasonId(e.target.value)}>
            <option value="">-- No Season --</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea rows={3} value={waveDesc} onChange={e => setWaveDesc(e.target.value)}></textarea>
        </div>
        <div className="form-group">
          <label>Wave Jam Page URL:</label>
          <input type="url" value={waveJamUrl} onChange={e => setWaveJamUrl(e.target.value)} placeholder="e.g. https://itch.io/jam/..." />
        </div>
        <div className="form-group">
          <label>Display Order:</label>
          <input type="number" value={waveOrder} onChange={e => setWaveOrder(parseInt(e.target.value) || 0)} min="0" />
        </div>
        <div className="form-group">
          <label>Banner Image:</label>
          <input type="file" accept="image/*" onChange={e => setWaveBannerFile(e.target.files?.[0] || null)} />
          {waveExistingBanner && !waveBannerFile && (
            <div style={{ marginTop: '8px' }}><small>Current:</small><br /><img src={waveExistingBanner} style={{ width: '120px', height: 'auto', borderRadius: '4px' }} alt="" /></div>
          )}
        </div>
      </AdminModal>

      {/* Top Member Modal */}
      <AdminModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={currentMember ? 'Edit Top Member' : 'Add Top Member'} onSubmit={handleMemberSubmit} isSaving={isSavingMember}>
        <div className="form-group">
          <label>Member Name:</label>
          <input type="text" value={memberName} onChange={e => setMemberName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Rank / Title:</label>
          <input type="text" value={memberRank} onChange={e => setMemberRank(e.target.value)} placeholder="e.g. 1st Place, Best Design" />
        </div>
        <div className="form-group">
          <label>Display Order:</label>
          <input type="number" value={memberOrder} onChange={e => setMemberOrder(parseInt(e.target.value) || 0)} min="0" />
        </div>
        <div className="form-group">
          <label>Photo:</label>
          <input type="file" accept="image/*" onChange={e => setMemberImageFile(e.target.files?.[0] || null)} />
          {memberExistingImage && !memberImageFile && (
            <div style={{ marginTop: '8px' }}><small>Current:</small><br /><img src={memberExistingImage} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} alt="" /></div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
