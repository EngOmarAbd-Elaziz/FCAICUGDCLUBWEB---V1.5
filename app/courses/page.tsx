import { createClient } from '@/lib/supabase/server';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
  const supabase = await createClient();

  // Fetch Courses
  const { data: courses } = await supabase.from('courses').select('*').order('display_order', { ascending: true });

  return (
    <div style={{ paddingTop: '100px' }}>
      <CoursesClient courses={courses || []} />
    </div>
  );
}
