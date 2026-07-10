import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, entity_type, entity_id, details, notification, email } = body;

    const results = {};

    // 1. Audit log
    if (action) {
      const log = await base44.asServiceRole.entities.AuditLog.create({
        action,
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        details: details || null,
        performed_by_id: user.id,
        performed_by_name: user.full_name || user.email,
        performed_by_role: user.role || null,
      });
      results.audit_log_id = log.id;
    }

    // 2. In-app notification
    if (notification) {
      const notif = await base44.asServiceRole.entities.StarNotification.create({
        title: notification.title,
        message: notification.message || '',
        notification_type: notification.type || 'system',
        link: notification.link || null,
        icon_hint: notification.icon_hint || null,
        is_read: false,
      });
      results.notification_id = notif.id;
    }

    // 3. Email
    if (email) {
      await base44.integrations.Core.SendEmail({
        to: email.to,
        subject: email.subject,
        body: email.body,
        from_name: email.from_name || 'STAR OS EJP',
      });
      results.email_sent = true;
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});