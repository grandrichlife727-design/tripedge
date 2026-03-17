import { createClient } from '@/lib/supabase/server';
import { getPreviewGroupById } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET(_request, { params }) {
  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ trip: getPreviewGroupById(params.id), preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('group_trips')
    .select('*, group_members(*, profiles(full_name, email, avatar_url))')
    .eq('id', params.id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json({ trip: data });
}

export async function PATCH(request, { params }) {
  const preview = getPreviewContext();
  if (preview) {
    const { destination_vote, date_vote, budget } = await request.json();
    return Response.json({
      member: {
        id: `preview-member-${params.id}`,
        group_trip_id: params.id,
        user_id: preview.user.id,
        destination_vote,
        date_vote,
        budget,
        has_voted: true,
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { destination_vote, date_vote, budget } = await request.json();

  const { data, error } = await supabase
    .from('group_members')
    .update({ destination_vote, date_vote, budget, has_voted: true })
    .eq('group_trip_id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ member: data });
}
