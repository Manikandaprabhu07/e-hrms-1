import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  notifications = this.notificationsSignal.asReadonly();
  notificationCount = computed(() => this.notificationsSignal().length);

  /**
   * Show success notification
   */
  success(message: string, duration: number = 3000): void {
    this.addNotification('success', message, duration);
  }

  /**
   * Show error notification
   */
  error(message: string, duration: number = 5000): void {
    this.addNotification('error', message, duration);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration: number = 4000): void {
    this.addNotification('warning', message, duration);
  }

  /**
   * Show info notification
   */
  info(message: string, duration: number = 3000): void {
    this.addNotification('info', message, duration);
  }

  /**
   * Add notification
   */
  private addNotification(
    type: Notification['type'],
    message: string,
    duration: number = 3000
  ): void {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      timestamp: new Date()
    };

    this.notificationsSignal.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.removeNotification(id), duration);
    }
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSignal.set([]);
  }
}
