import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from './notification.service';

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
  private platformId = inject(PLATFORM_ID);
  private toast = inject(NotificationService);

  private openSignal = signal<boolean>(false);
  isOpen = this.openSignal.asReadonly();

  private overviewSignal = signal<ChatbarOverview>({ unreadNotifications: 0, unreadMessages: 0 });
  overview = this.overviewSignal.asReadonly();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private hasLoadedOverview = false;

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
    const previous = this.overviewSignal();
    const previousTotal = (previous.unreadNotifications || 0) + (previous.unreadMessages || 0);
    const nextTotal = (ov?.unreadNotifications || 0) + (ov?.unreadMessages || 0);

    this.overviewSignal.set(ov || { unreadNotifications: 0, unreadMessages: 0 });

    if (this.hasLoadedOverview && nextTotal > previousTotal) {
      this.playNotificationSound();
      this.toast.info('New notification or chat message received.');
    }
    this.hasLoadedOverview = true;
  }

  startLiveUpdates(intervalMs = 5000): void {
    if (!isPlatformBrowser(this.platformId) || this.pollTimer) {
      return;
    }

    void this.loadOverview().catch(() => undefined);
    this.pollTimer = setInterval(() => {
      void this.loadOverview().catch(() => undefined);
    }, intervalMs);
  }

  stopLiveUpdates(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
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

  private playNotificationSound(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.setValueAtTime(660, context.currentTime + 0.09);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.24);
      setTimeout(() => void context.close().catch(() => undefined), 400);
    } catch {
      // Browsers can block audio before a user gesture; polling still continues.
    }
  }
}
