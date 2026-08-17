import { createClient } from '@/lib/supabase/server';
import WavesClient from './WavesClient';

export default async function WavesPage() {
  const supabase = await createClient();

  // Fetch Waves and their relations
  const { data: seasons } = await supabase.from('seasons').select('*').order('display_order', { ascending: true });
  const { data: wavesData } = await supabase.from('waves').select(`
    *,
    wave_top_members (*)
  `).order('display_order', { ascending: true });

  return (
    <div style={{ paddingTop: '100px' }}>
      <WavesClient seasons={seasons || []} waves={wavesData || []} />
    </div>
  );
}
