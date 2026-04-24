import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = '/api/events';

  getUpcomingEvents(): Promise<EventItem[]> {
    return new Promise((resolve, reject) => {
      this.http.get<EventItem[]>(this.apiUrl).subscribe({
        next: (events) => resolve(events || []),
        error: reject,
      });
    });
  }

  createEvent(event: Partial<EventItem>): Promise<EventItem> {
    return new Promise((resolve, reject) => {
      this.http.post<EventItem>(this.apiUrl, event).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  updateEvent(id: string, changes: Partial<EventItem>): Promise<EventItem> {
    return new Promise((resolve, reject) => {
      this.http.put<EventItem>(`${this.apiUrl}/${id}`, changes).subscribe({
        next: resolve,
        error: reject,
      });
    });
  }

  deleteEvent(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => resolve(),
        error: reject,
      });
    });
  }
}
