import { calendar_v3, google } from "googleapis";
import { logger } from "@/lib/logger";

let calendarClient: calendar_v3.Calendar | null = null;

interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
}

interface CalendarEventResponse {
  eventId: string;
  eventUrl: string;
  calendarLink: string;
}

/**
 * Initialize Google Calendar API client
 */
export function getCalendarClient(): calendar_v3.Calendar {
  if (!calendarClient) {
    const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CALENDAR_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error("Google Calendar credentials not configured");
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    calendarClient = google.calendar({ version: "v3", auth });
  }

  return calendarClient;
}

/**
 * Check if Google Calendar is configured
 */
export function isCalendarConfigured(): boolean {
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  return !!privateKey && !!clientEmail && !!calendarId;
}

/**
 * Create a calendar event for property booking
 */
export async function createBookingEvent(event: CalendarEvent): Promise<CalendarEventResponse> {
  if (!isCalendarConfigured()) {
    throw new Error("Google Calendar not configured");
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    const eventBody: any = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: process.env.TIMEZONE || "UTC",
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: process.env.TIMEZONE || "UTC",
      },
      attendees: event.attendees?.map((email) => ({
        email,
        responseStatus: "needsAction",
      })),
      location: event.location,
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: {
            key: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert(
      {
        calendarId,
        conferenceDataVersion: 1,
      },
      eventBody
    );

    const eventData = response.data as any;

    logger.info("[Calendar] Booking event created", {
      eventId: eventData?.id,
      title: event.title,
    });

    return {
      eventId: eventData?.id || "",
      eventUrl: eventData?.htmlLink || "",
      calendarLink: `https://calendar.google.com/calendar/u/0/r/eventedit/${eventData?.id}`,
    };
  } catch (error) {
    logger.error("[Calendar] Failed to create booking event", error);
    throw error;
  }
}

/**
 * Cancel a calendar event
 */
export async function cancelBookingEvent(eventId: string): Promise<void> {
  if (!isCalendarConfigured()) {
    throw new Error("Google Calendar not configured");
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    logger.info("[Calendar] Booking event cancelled", { eventId });
  } catch (error) {
    logger.error("[Calendar] Failed to cancel booking event", error);
    throw error;
  }
}

/**
 * Get available time slots for a property
 */
export async function getAvailableSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 60
): Promise<Array<{ start: Date; end: Date }>> {
  if (!isCalendarConfigured()) {
    throw new Error("Google Calendar not configured");
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busyTimes = response.data.calendars?.[calendarId]?.busy || [];
    const availableSlots: Array<{ start: Date; end: Date }> = [];

    // Convert busy times to available slots
    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

      const isSlotBusy = busyTimes.some((busy) => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return currentTime < busyEnd && slotEnd > busyStart;
      });

      if (!isSlotBusy) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
        });
      }

      currentTime = slotEnd;
    }

    logger.info("[Calendar] Available slots retrieved", {
      count: availableSlots.length,
    });

    return availableSlots;
  } catch (error) {
    logger.error("[Calendar] Failed to get available slots", error);
    throw error;
  }
}

/**
 * Update a calendar event
 */
export async function updateBookingEvent(
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEventResponse> {
  if (!isCalendarConfigured()) {
    throw new Error("Google Calendar not configured");
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID!;

    const updateBody: any = {
      summary: updates.title,
      description: updates.description,
      location: updates.location,
    };

    if (updates.startTime) {
      updateBody.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: process.env.TIMEZONE || "UTC",
      };
    }

    if (updates.endTime) {
      updateBody.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: process.env.TIMEZONE || "UTC",
      };
    }

    const response = await calendar.events.update(
      {
        calendarId,
        eventId,
      },
      updateBody
    );

    const eventData = response.data as any;

    logger.info("[Calendar] Booking event updated", { eventId });

    return {
      eventId: eventData?.id || "",
      eventUrl: eventData?.htmlLink || "",
      calendarLink: `https://calendar.google.com/calendar/u/0/r/eventedit/${eventData?.id}`,
    };
  } catch (error) {
    logger.error("[Calendar] Failed to update booking event", error);
    throw error;
  }
}
