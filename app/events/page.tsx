import { createClient } from '@/lib/supabase/server';
import EventsClient from './EventsClient';

export default async function EventsPage() {
  const supabase = await createClient();

  // Fetch Seasons, Events & Gallery
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: eventsData } = await supabase
    .from('events')
    .select(`
      *,
      event_gallery (*)
    `)
    .order('display_order', { ascending: true });

  return (
    <div style={{ paddingTop: '100px' }}>
      <EventsClient seasons={seasons || []} events={eventsData || []} />
    </div>
  );
}
