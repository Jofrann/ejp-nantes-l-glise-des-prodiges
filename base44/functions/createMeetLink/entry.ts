import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event_id, title, event_date, event_time, end_time, description } = body;

    if (!title || !event_date) {
      return Response.json({ error: 'title and event_date are required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlemeet');

    // Build start/end datetime in ISO format
    const startDateTime = event_time
      ? new Date(`${event_date}T${event_time}:00`).toISOString()
      : new Date(`${event_date}T09:00:00`).toISOString();

    const endDateTime = end_time
      ? new Date(`${event_date}T${end_time}:00`).toISOString()
      : new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

    // Create a Calendar event with Meet conference data
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: title,
        description: description || '',
        start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
        end: { dateTime: endDateTime, timeZone: 'Europe/Paris' },
        conferenceData: {
          createRequest: {
            requestId: `ejp-meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    });

    if (!calendarResponse.ok) {
      const err = await calendarResponse.text();
      return Response.json({ error: `Google Calendar API error: ${err}` }, { status: 502 });
    }

    const eventData = await calendarResponse.json();
    const meetUrl = eventData?.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri
      || eventData?.hangoutLink
      || null;

    if (!meetUrl) {
      return Response.json({ error: 'No Meet link returned by Google' }, { status: 502 });
    }

    // If event_id provided, save the meet_url on the Event entity
    if (event_id) {
      await base44.asServiceRole.entities.Event.update(event_id, { meet_url: meetUrl });
    }

    return Response.json({ meet_url: meetUrl, calendar_event_id: eventData.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});