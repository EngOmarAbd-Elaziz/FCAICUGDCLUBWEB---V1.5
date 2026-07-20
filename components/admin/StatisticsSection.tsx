'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from './AdminContext';

export function StatisticsSection() {
  const [stats, setStats] = useState({
    id: '',
    students_count: 0,
    graduates_count: 0,
    projects_count: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const { showToast } = useAdminContext();

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .limit(1)
        .single();
        
      if (data) {
        setStats(data);
      }
      setIsLoading(false);
    };
    fetchStats();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (stats.id) {
        const { error } = await supabase
          .from('statistics')
          .update({
            students_count: stats.students_count,
            graduates_count: stats.graduates_count,
            projects_count: stats.projects_count,
            updated_at: new Date().toISOString()
          })
          .eq('id', stats.id);
        if (error) throw error;
      } else {
        // Create if it doesn't exist
        const { error } = await supabase
          .from('statistics')
          .insert([{
            students_count: stats.students_count,
            graduates_count: stats.graduates_count,
            projects_count: stats.projects_count
          }]);
        if (error) throw error;
      }
      showToast('Statistics updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to update statistics: ${err.message}`, 'error');
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
        <h2>Statistics Overview</h2>
      </div>
      <form id="stats-form" onSubmit={handleSubmit}>
        <div className="stats-grid">
          <div className="stats-card-input">
            <i className="fas fa-users"></i>
            <input 
              type="number" 
              id="students-count" 
              name="students_count" 
              required min="0"
              value={stats.students_count}
              onChange={(e) => setStats({...stats, students_count: parseInt(e.target.value) || 0})}
            />
            <label>Enrolled Students</label>
          </div>
          <div className="stats-card-input">
            <i className="fas fa-graduation-cap"></i>
            <input 
              type="number" 
              id="graduates-count" 
              name="graduates_count" 
              required min="0"
              value={stats.graduates_count}
              onChange={(e) => setStats({...stats, graduates_count: parseInt(e.target.value) || 0})}
            />
            <label>Graduates Count</label>
          </div>
          <div className="stats-card-input">
            <i className="fas fa-gamepad"></i>
            <input 
              type="number" 
              id="projects-count" 
              name="projects_count" 
              required min="0"
              value={stats.projects_count}
              onChange={(e) => setStats({...stats, projects_count: parseInt(e.target.value) || 0})}
            />
            <label>Projects Completed</label>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Update Statistics</>}
        </button>
      </form>
    </div>
  );
}
