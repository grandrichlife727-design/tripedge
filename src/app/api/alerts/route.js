import { createClient } from '@/lib/supabase/server';
import { PLAN_CONFIG } from '@/lib/stripe';
import { getPreviewAlerts } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET() {
  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ alerts: getPreviewAlerts(), preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('price_alerts')
    .select('*, routes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alerts: data });
}

export async function POST(request) {
  const preview = getPreviewContext();
  if (preview) {
    const { route_id, target_price } = await request.json();
    return Response.json({
      alert: {
        id: `preview-alert-${Date.now()}`,
        route_id: route_id || 'route-lisbon',
        target_price: target_price || null,
        alert_on_any_drop: !target_price,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
  const limit = PLAN_CONFIG[profile.tier]?.alertLimit || 1;

  const { count } = await supabase.from('price_alerts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true);
  if (count >= limit) {
    return Response.json({ error: `Alert limit reached (${limit}). Upgrade for more.`, limit_reached: true }, { status: 429 });
  }

  const { route_id, target_price } = await request.json();
  const { data, error } = await supabase.from('price_alerts').insert({ user_id: user.id, route_id, target_price: target_price || null, alert_on_any_drop: !target_price }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alert: data });
}

export async function DELETE(request) {
  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ deleted: true, preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase.from('price_alerts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ deleted: true });
}

export async function PATCH(request) {
  const preview = getPreviewContext();
  if (preview) {
    const { id, is_active } = await request.json();
    return Response.json({
      alert: {
        id,
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString(),
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, is_active } = await request.json();
  const { data, error } = await supabase
    .from('price_alerts')
    .update({ is_active: Boolean(is_active) })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, routes(*)')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alert: data });
}
