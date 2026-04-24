import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ChatbarOverview {
  unreadNotifications: number;
  unreadMessages: number;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  meta?: any;
}

export interface ApiConversation {
  id: string;
  employeeUserId: string;
  adminUserId: string;
  unreadCount: number;
  updatedAt: string;
  lastMessage?: { content: string; createdAt: string; senderUserId: string } | null;
}

export interface ApiMessage {
  id: string;
  senderUserId: string;
  content: string;
  createdAt: string;
  unreadForAdmin: boolean;
  unreadForEmployee: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatbarService {
  private http = inject(HttpClient);

  private openSignal = signal<boolean>(false);
  isOpen = this.openSignal.asReadonly();

  private overviewSignal = signal<ChatbarOverview>({ unreadNotifications: 0, unreadMessages: 0 });
  overview = this.overviewSignal.asReadonly();

  open(): void {
    this.openSignal.set(true);
  }

  close(): void {
    this.openSignal.set(false);
  }

  toggle(): void {
    this.openSignal.update((v) => !v);
  }

  async loadOverview(): Promise<void> {
    const ov = await firstValueFrom(this.http.get<ChatbarOverview>('/api/chatbar/overview'));
    this.overviewSignal.set(ov || { unreadNotifications: 0, unreadMessages: 0 });
  }

  getMyNotifications(): Promise<ApiNotification[]> {
    return firstValueFrom(this.http.get<ApiNotification[]>('/api/notifications/my')) as any;
  }

  markAllNotificationsRead(): Promise<any> {
    return firstValueFrom(this.http.patch('/api/notifications/my/read-all', {})) as any;
  }

  markNotificationRead(id: string): Promise<any> {
    return firstValueFrom(this.http.patch(`/api/notifications/${id}/read`, {})) as any;
  }

  getMyConversations(): Promise<ApiConversation[]> {
    return firstValueFrom(this.http.get<ApiConversation[]>('/api/messages/my/conversations')) as any;
  }

  startMyConversation(): Promise<any> {
    return firstValueFrom(this.http.post('/api/messages/start', {})) as any;
  }

  startConversationForEmployee(employeeId: string): Promise<any> {
    return firstValueFrom(this.http.post(`/api/messages/start/employee/${employeeId}`, {})) as any;
  }

  getConversationMessages(conversationId: string): Promise<ApiMessage[]> {
    return firstValueFrom(this.http.get<ApiMessage[]>(`/api/messages/conversations/${conversationId}`)) as any;
  }

  markConversationRead(conversationId: string): Promise<any> {
    return firstValueFrom(this.http.patch(`/api/messages/conversations/${conversationId}/read`, {})) as any;
  }

  sendMessage(conversationId: string, content: string): Promise<ApiMessage> {
    return firstValueFrom(this.http.post<ApiMessage>(`/api/messages/conversations/${conversationId}`, { content })) as any;
  }
}
