import { createClient } from '@/lib/supabase/server';
import { getPreviewSavedSpots } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET() {
  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ spots: getPreviewSavedSpots(), preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('saved_spots').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ spots: data || [] });
}

export async function POST(request) {
  const preview = getPreviewContext();
  if (preview) {
    const body = await request.json();
    return Response.json({
      spot: {
        id: `preview-spot-${Date.now()}`,
        name: body.name || 'Preview spot',
        city: body.city || 'Lisbon',
        country: body.country || 'Portugal',
        source_platform: body.source_platform || 'manual',
        source_url: body.source_url || null,
        source_note: body.source_note || null,
        category: body.category || 'gem',
        thumbnail_url: body.thumbnail_url || null,
        metadata: body.metadata || {},
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const payload = {
    user_id: user.id,
    name: body.name,
    city: body.city || null,
    country: body.country || null,
    source_platform: body.source_platform || 'manual',
    source_url: body.source_url || null,
    source_note: body.source_note || null,
    category: body.category || null,
    thumbnail_url: body.thumbnail_url || null,
    metadata: body.metadata || {},
  };

  if (!payload.name) return Response.json({ error: 'name is required' }, { status: 400 });

  const { data, error } = await supabase.from('saved_spots').insert(payload).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ spot: data });
}
