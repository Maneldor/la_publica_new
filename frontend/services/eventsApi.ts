export interface Event {
  id: string;
  title: string;
  type: 'MEETING' | 'CALL' | 'PRESENTATION' | 'TRAINING' | 'DEADLINE' | 'REMINDER' | 'OTHER';
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  companyId?: string;
  leadId?: string;
  contactId?: string;
  company?: {
    id: string;
    name: string;
  };
  lead?: {
    id: string;
    companyName: string;
  };
  contact?: {
    id: string;
    name: string;
  };
  attendees?: EventAttendee[];
  reminders?: EventReminder[];
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
  user?: {
    employee?: {
      firstName: string;
      lastName: string;
    };
    company?: {
      name: string;
    };
  };
}

export interface EventReminder {
  id: string;
  eventId: string;
  type: 'EMAIL' | 'NOTIFICATION' | 'SMS';
  minutesBefore: number;
  isSent: boolean;
}

export interface CreateEventRequest {
  title: string;
  type: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  priority?: string;
  companyId?: string;
  leadId?: string;
  contactId?: string;
  attendeeEmails?: string[];
  reminders?: {
    type: string;
    minutesBefore: number;
  }[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

class EventsApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  // Obtenir esdeveniments
  async getEvents(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    companyId?: string;
    leadId?: string;
  }): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const url = `/api/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<Event[]>(url);
  }

  // Obtenir un esdeveniment per ID
  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`);
  }

  // Crear esdeveniment
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Actualitzar esdeveniment
  async updateEvent(id: string, eventData: UpdateEventRequest): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  // Eliminar esdeveniment
  async deleteEvent(id: string): Promise<void> {
    await this.request<void>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtenir estadístiques
  async getEventStats(): Promise<{
    todayEvents: number;
    pendingMeetings: number;
    weeklyEvents: number;
    pendingResponses: number;
  }> {
    return this.request<{
      todayEvents: number;
      pendingMeetings: number;
      weeklyEvents: number;
      pendingResponses: number;
    }>('/api/events/stats');
  }

  // Obtenir esdeveniments del mes
  async getMonthEvents(year: number, month: number): Promise<Event[]> {
    return this.request<Event[]>(`/api/events/month/${year}/${month}`);
  }

  // Obtenir esdeveniments de la setmana
  async getWeekEvents(year: number, week: number): Promise<Event[]> {
    return this.request<Event[]>(`/api/events/week/${year}/${week}`);
  }

  // Obtenir esdeveniments del dia
  async getDayEvents(date: string): Promise<Event[]> {
    return this.request<Event[]>(`/api/events/day/${date}`);
  }

  // Actualitzar assistència d'un convidat
  async updateAttendeeStatus(eventId: string, status: string): Promise<void> {
    await this.request<void>(`/api/events/${eventId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const eventsApi = new EventsApiService();
export default eventsApi;