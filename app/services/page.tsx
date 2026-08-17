import { createClient } from '@/lib/supabase/server';
import ServicesClient from './ServicesClient';

export default async function ServicesPage() {
  const supabase = await createClient();

  // Fetch Courses
  const { data: courses } = await supabase.from('courses').select('*').order('display_order', { ascending: true });

  return (
    <div style={{ paddingTop: '100px' }}>
      <ServicesClient courses={courses || []} />
    </div>
  );
}
