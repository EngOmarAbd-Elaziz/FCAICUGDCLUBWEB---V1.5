'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';

const SETTINGS_KEYS = [
  { key: 'footer_email', label: 'Footer Email', type: 'email' },
  { key: 'footer_phone', label: 'Footer Phone', type: 'text' },
  { key: 'hero_tagline', label: 'Hero Tagline / Subtitle', type: 'text' },
  { key: 'mission_text', label: 'Mission Statement', type: 'textarea' },
  { key: 'vision_text', label: 'Vision Statement', type: 'textarea' },
];

export function SiteSettingsSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const { showToast } = useAdminContext();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
        
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => {
          map[row.key] = row.value || '';
        });
        setSettings(map);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, [supabase]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Upsert all settings
      const rows = SETTINGS_KEYS.map(s => ({
        key: s.key,
        value: settings[s.key] || '',
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' });

      if (error) throw error;
      showToast('Site settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to update site settings: ${err.message}`, 'error');
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
        <h2>Site Settings</h2>
      </div>
      <form id="settings-form" onSubmit={handleSubmit}>
        {SETTINGS_KEYS.map(s => (
          <div className="form-group" key={s.key}>
            <label>{s.label}:</label>
            {s.type === 'textarea' ? (
              <textarea
                rows={4}
                value={settings[s.key] || ''}
                onChange={(e) => handleChange(s.key, e.target.value)}
              ></textarea>
            ) : (
              <input
                type={s.type}
                value={settings[s.key] || ''}
                onChange={(e) => handleChange(s.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
