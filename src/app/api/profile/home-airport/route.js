import { createClient } from '@/lib/supabase/server';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function PATCH(request) {
  const { home_airport } = await request.json();
  const normalized = String(home_airport || '').trim().toUpperCase();

  if (!normalized) {
    return Response.json({ error: 'home_airport is required' }, { status: 400 });
  }

  const preview = getPreviewContext();
  if (preview) {
    return Response.json({
      profile: {
        ...preview.profile,
        home_airport: normalized,
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .update({ home_airport: normalized })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ profile: data });
}
