import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  conversation: Conversation;

  @Index()
  @Column()
  senderUserId: string;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @Column({ default: false })
  unreadForAdmin: boolean;

  @Index()
  @Column({ default: false })
  unreadForEmployee: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

