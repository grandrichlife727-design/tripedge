import { createClient } from '@/lib/supabase/server';
import { getPreviewGroups } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET() {
  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ trips: getPreviewGroups(preview.tier), preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('group_members')
    .select('group_trips(*, group_members(*))')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  const trips = data.map((d) => d.group_trips).filter(Boolean);
  return Response.json({ trips });
}

export async function POST(request) {
  const preview = getPreviewContext();
  if (preview) {
    const { name, destination_options, date_options } = await request.json();
    return Response.json({
      trip: {
        id: `preview-created-${Date.now()}`,
        creator_id: preview.user.id,
        name: name || 'New Preview Trip',
        destination_options: destination_options || [],
        date_options: date_options || [],
        invite_code: 'PREVIEW7',
        group_members: [],
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, destination_options, date_options } = await request.json();
  if (!name?.trim()) return Response.json({ error: 'Trip name is required' }, { status: 400 });

  const { data: trip, error: tripError } = await supabase
    .from('group_trips')
    .insert({ creator_id: user.id, name, destination_options: destination_options || [], date_options: date_options || [] })
    .select()
    .single();

  if (tripError) return Response.json({ error: tripError.message }, { status: 500 });

  await supabase.from('group_members').insert({ group_trip_id: trip.id, user_id: user.id, role: 'creator' });
  return Response.json({ trip });
}
