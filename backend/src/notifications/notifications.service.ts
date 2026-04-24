import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) { }

  async getMy(userId: string, limit = 30): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({ where: { userId, isRead: false } });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.notificationsRepository.update({ id, userId } as any, { isRead: true } as any);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId, isRead: false } as any, { isRead: true } as any);
  }

  async createForUser(input: {
    userId: string;
    type?: NotificationType;
    title: string;
    message: string;
    link?: string;
    meta?: any;
  }): Promise<Notification> {
    const n = this.notificationsRepository.create({
      userId: input.userId,
      type: input.type ?? 'system',
      title: input.title,
      message: input.message,
      link: input.link,
      meta: input.meta,
      isRead: false,
    });
    return this.notificationsRepository.save(n);
  }

  async createForUsers(input: {
    userIds: string[];
    type?: NotificationType;
    title: string;
    message: string;
    link?: string;
    meta?: any;
  }): Promise<void> {
    if (!input.userIds?.length) return;
    const rows = input.userIds.map((userId) => ({
      userId,
      type: input.type ?? 'system',
      title: input.title,
      message: input.message,
      link: input.link,
      meta: input.meta,
      isRead: false,
    }));
    await this.notificationsRepository.insert(rows as any);
  }
}

