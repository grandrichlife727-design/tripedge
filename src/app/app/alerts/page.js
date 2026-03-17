import { createClient } from '@/lib/supabase/server';
import { getPreviewAlerts } from '@/lib/preview-auth';
import { getPreviewContext } from '@/lib/preview-auth-server';
import { AlertsManager } from '@/components/dashboard/AlertsManager';

export default async function AlertsPage() {
  const preview = getPreviewContext();
  let alerts = [];
  let error = null;

  if (preview) {
    alerts = getPreviewAlerts();
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: alertsError } = await supabase
      .from('price_alerts')
      .select('*, routes(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    alerts = data || [];
    error = alertsError;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-card border border-warning-border bg-warning-light p-4 text-sm text-warning">
          Could not load alerts: {error.message}
        </div>
      ) : null}

      {!error ? <AlertsManager initialAlerts={alerts} /> : null}
    </div>
  );
}
