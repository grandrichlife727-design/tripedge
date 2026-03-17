import { createClient } from '@/lib/supabase/server';
import { PLAN_CONFIG } from '@/lib/stripe';
import { getPreviewGroupById } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function POST(request) {
  const preview = getPreviewContext();
  if (preview) {
    const trip = getPreviewGroupById('preview-group-lisbon');
    return Response.json({ joined: true, trip_id: trip.id, trip, preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { invite_code } = await request.json();
  const { data: trip, error: tripError } = await supabase
    .from('group_trips')
    .select('*, group_members(*)')
    .eq('invite_code', invite_code)
    .single();

  if (tripError || !trip) {
    return Response.json({ error: 'Invalid invite code' }, { status: 404 });
  }

  if (trip.group_members.some((m) => m.user_id === user.id)) {
    return Response.json({ error: 'Already a member', trip });
  }

  const { data: creatorProfile } = await supabase.from('profiles').select('tier').eq('id', trip.creator_id).single();
  const limit = PLAN_CONFIG[creatorProfile.tier]?.groupMemberLimit || 3;
  if (trip.group_members.length >= limit) {
    return Response.json({ error: `Group is full (${limit} members max on ${creatorProfile.tier} plan)`, limit_reached: true }, { status: 429 });
  }

  const { error } = await supabase.from('group_members').insert({ group_trip_id: trip.id, user_id: user.id, role: 'member' });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ joined: true, trip_id: trip.id });
}
