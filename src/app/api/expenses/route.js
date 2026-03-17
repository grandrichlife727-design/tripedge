import { createClient } from '@/lib/supabase/server';
import { getPreviewExpenses } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const groupTripId = searchParams.get('groupTripId');
  if (!groupTripId) return Response.json({ error: 'groupTripId is required' }, { status: 400 });

  const preview = getPreviewContext();
  if (preview) {
    return Response.json({ expenses: getPreviewExpenses(groupTripId), preview: true });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('trip_expenses').select('*').eq('group_trip_id', groupTripId).order('expense_date', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ expenses: data || [] });
}

export async function POST(request) {
  const preview = getPreviewContext();
  const body = await request.json();

  if (!body.group_trip_id || !body.description || !body.amount) {
    return Response.json({ error: 'group_trip_id, description, and amount are required' }, { status: 400 });
  }

  if (preview) {
    return Response.json({
      expense: {
        id: `preview-expense-${Date.now()}`,
        group_trip_id: body.group_trip_id,
        paid_by_user_id: preview.user.id,
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'USD',
        category: body.category || 'other',
        split_type: body.split_type || 'equal',
        split_details: body.split_details || null,
        expense_date: body.expense_date || new Date().toISOString().slice(0, 10),
      },
      preview: true,
    });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = {
    group_trip_id: body.group_trip_id,
    paid_by_user_id: user.id,
    description: body.description,
    amount: body.amount,
    currency: body.currency || 'USD',
    category: body.category || 'other',
    split_type: body.split_type || 'equal',
    split_details: body.split_details || null,
    expense_date: body.expense_date || new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase.from('trip_expenses').insert(payload).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ expense: data });
}
