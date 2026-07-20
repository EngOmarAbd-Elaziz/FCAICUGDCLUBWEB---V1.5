import { createClient } from '@/lib/supabase/server';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Fetch Events & Gallery
  const { data: eventsData } = await supabase.from('events').select(`
    *,
    event_gallery (*)
  `).order('display_order', { ascending: true });

  // Fetch Courses
  const { data: courses } = await supabase.from('courses').select('*').order('display_order', { ascending: true });

  // Fetch Waves and their relations
  const { data: seasons } = await supabase.from('seasons').select('*').order('display_order', { ascending: true });
  const { data: wavesData } = await supabase.from('waves').select(`
    *,
    wave_top_members (*)
  `).order('display_order', { ascending: true });

  return (
    <div style={{ paddingTop: '100px' }}>
      <ProjectsClient 
        events={eventsData || []} 
        courses={courses || []} 
        seasons={seasons || []} 
        waves={wavesData || []} 
      />
    </div>
  );
}
