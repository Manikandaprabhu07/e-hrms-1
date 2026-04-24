import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private apiUrl = '/api/feedback';

  sendFeedback(message: string, employeeId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(this.apiUrl, { employeeId, message }).subscribe({
        next: (data) => resolve(data),
        error: (error) => reject(error)
      });
    });
  }

  getAll(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: (data) => resolve(data || []),
        error: (error) => reject(error),
      });
    });
  }
}
