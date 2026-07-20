import { createClient } from '@/lib/supabase/server';
import TeamClient from './TeamClient';

export default async function TeamPage() {
  const supabase = await createClient();

  // Fetch seasons
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch core team members with their associated season relations
  const { data: teamMembers } = await supabase
    .from('core_team_members')
    .select('*, team_member_seasons(season_id)')
    .order('display_order', { ascending: true });

  return (
    <section className="team" style={{ minHeight: '80vh', paddingTop: '120px' }}>
      <div className="container">
        <h2>Our Core Team</h2>
        <TeamClient seasons={seasons || []} teamMembers={teamMembers || []} />
      </div>
    </section>
  );
}
