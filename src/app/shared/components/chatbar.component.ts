import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ChatbarService, EmployeeService } from '../../core/services';

@Component({
  selector: 'app-chatbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbar" [class.open]="open()">
      <div class="chatbar-header">
        <div class="title">
          <div class="name">Inbox</div>
          <div class="meta">
            <span class="pill">Notifications: {{ overview().unreadNotifications }}</span>
            <span class="pill">Messages: {{ overview().unreadMessages }}</span>
          </div>
        </div>
        <button class="icon-btn" (click)="toggle()">×</button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="tab() === 'notifications'" (click)="setTab('notifications')">Notifications</button>
        <button class="tab" [class.active]="tab() === 'messages'" (click)="setTab('messages')">Messages</button>
      </div>

      @if (tab() === 'notifications') {
        <div class="panel">
          <div class="panel-actions">
            <button class="btn" (click)="markAllRead()">Mark all read</button>
            <button class="btn" (click)="refresh()">Refresh</button>
          </div>

          @if (loading()) {
            <p class="muted">Loading...</p>
          } @else if (notifications().length === 0) {
            <p class="muted">No notifications.</p>
          } @else {
            <div class="list">
              @for (n of notifications(); track n.id) {
                <div class="item" [class.unread]="!n.isRead" (click)="openNotification(n)">
                  <div class="item-top">
                    <div class="item-title">{{ n.title }}</div>
                    <div class="item-time">{{ formatTime(n.createdAt) }}</div>
                  </div>
                  <div class="item-body">{{ n.message }}</div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="panel">
          <div class="panel-actions">
            <button class="btn" (click)="refresh()">Refresh</button>
          </div>

          @if (conversationId() === null) {
            <div class="muted">
              @if (isAdmin()) {
                <p>Start a conversation with an employee.</p>
                <div class="admin-start">
                  <select [(ngModel)]="selectedEmployeeId">
                    <option value="">Select employee</option>
                    @for (emp of employees(); track emp.id) {
                      <option [value]="emp.id">{{ emp.employeeId }} - {{ emp.firstName }} {{ emp.lastName }}</option>
                    }
                  </select>
                  <button class="btn primary" (click)="startAdminConversation()" [disabled]="!selectedEmployeeId">Start</button>
                </div>
                @if ((conversations().length || 0) === 0) {
                  <p class="muted" style="margin-top:10px">No conversations yet.</p>
                }
              } @else {
                <p>Open your conversation with Admin.</p>
                <button class="btn primary" (click)="startConversation()">Start Conversation</button>
              }
            </div>
          } @else {
            <div class="messages">
              @if (isAdmin() && conversations().length > 0) {
                <div class="admin-select">
                  <label>Conversation</label>
                  <select [(ngModel)]="selectedConversationId" (ngModelChange)="onSelectConversation($event)">
                    @for (c of conversations(); track c.id) {
                      <option [value]="c.id">
                        {{ c.unreadCount > 0 ? '(' + c.unreadCount + ') ' : '' }}{{ c.title || (c.employee?.name ?? c.id) }}
                      </option>
                    }
                  </select>
                </div>
              }
              @if (msgLoading()) {
                <p class="muted">Loading messages...</p>
              } @else {
                <div class="msg-list">
                  @for (m of messages(); track m.id) {
                    <div class="msg" [class.mine]="m.senderUserId === myUserId()">
                      <div class="sender">{{ senderLabel(m) }}</div>
                      <div class="bubble">{{ m.content }}</div>
                      <div class="msg-time">{{ formatTime(m.createdAt) }}</div>
                    </div>
                  }
                </div>
              }
              <div class="composer">
                <input [(ngModel)]="draft" placeholder="Type a message..." (keydown.enter)="send()" />
                <button class="btn primary" (click)="send()" [disabled]="sending()">Send</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <div class="backdrop" *ngIf="open()" (click)="toggle()"></div>
  `,
  styles: [`
    .chatbar {
      position: fixed;
      top: 0;
      right: -380px;
      width: 380px;
      height: 100vh;
      background: var(--surface-glass-strong);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-left: 1px solid var(--border-soft);
      box-shadow: -10px 0 30px var(--shadow-strong);
      z-index: 300;
      transition: right 0.25s ease;
      display: flex;
      flex-direction: column;
    }
    .chatbar.open { right: 0; }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.25);
      z-index: 250;
    }

    .chatbar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 14px;
      border-bottom: 1px solid var(--border-soft);
    }
    .name { font-weight: 800; font-size: 16px; color: var(--text-primary); }
    .meta { margin-top: 6px; display: flex; gap: 8px; }
    .pill {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary);
      background: var(--surface-subtle);
      padding: 3px 8px;
      border-radius: 999px;
    }
    .icon-btn {
      border: none;
      background: transparent;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      color: var(--text-secondary);
    }

    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--border-soft);
    }
    .tab {
      padding: 10px 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-weight: 800;
      color: var(--text-secondary);
    }
    .tab.active {
      color: var(--text-primary);
      background: rgba(37,99,235,0.08);
    }

    .panel { padding: 12px; overflow: auto; flex: 1; }
    .panel-actions { display: flex; gap: 8px; margin-bottom: 10px; }

    .btn {
      border: 1px solid var(--border-soft);
      background: var(--surface-subtle);
      padding: 7px 10px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 800;
      font-size: 12px;
      color: var(--text-primary);
    }
    .btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .muted { color: var(--text-muted); font-size: 13px; }

    .list { display: flex; flex-direction: column; gap: 10px; }
    .item {
      border: 1px solid var(--border-soft);
      background: var(--surface-subtle);
      border-radius: 12px;
      padding: 10px 10px;
      cursor: pointer;
    }
    .item.unread { border-color: rgba(37,99,235,0.45); }
    .item-top { display: flex; justify-content: space-between; gap: 10px; }
    .item-title { font-weight: 900; font-size: 13px; color: var(--text-primary); }
    .item-time { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
    .item-body { margin-top: 6px; font-size: 12px; color: var(--text-secondary); }

    .messages { display: flex; flex-direction: column; height: 100%; }
    .msg-list { flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 6px; }
    .msg { display: flex; flex-direction: column; align-items: flex-start; }
    .msg.mine { align-items: flex-end; }
    .sender {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      margin-bottom: 3px;
    }
    .bubble {
      max-width: 90%;
      background: var(--surface-subtle);
      padding: 10px 10px;
      border-radius: 12px;
      font-size: 13px;
      color: var(--text-primary);
      border: 1px solid var(--border-soft);
    }
    .msg.mine .bubble {
      background: rgba(37,99,235,0.10);
      border-color: rgba(37,99,235,0.18);
    }
    .msg-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .composer { display: flex; gap: 8px; margin-top: 10px; }
    .composer input {
      flex: 1;
      padding: 10px 10px;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
      outline: none;
      background: var(--surface-glass-strong);
    }

    .admin-select {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      background: var(--surface-subtle);
    }
    .admin-select label { font-size: 11px; font-weight: 900; color: var(--text-muted); }
    .admin-select select {
      width: 100%;
      padding: 10px 10px;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
      background: var(--surface-glass-strong);
      outline: none;
      font-size: 12px;
    }

    .admin-start {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      align-items: center;
    }
    .admin-start select {
      flex: 1;
      padding: 10px 10px;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
      background: var(--surface-glass-strong);
      outline: none;
      font-size: 12px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbarComponent implements OnInit {
  private chatbarService = inject(ChatbarService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  open = this.chatbarService.isOpen;
  tab = signal<'notifications' | 'messages'>('notifications');

  overview = this.chatbarService.overview;

  loading = signal(false);
  notifications = signal<any[]>([]);

  conversationId = signal<string | null>(null);
  conversations = signal<any[]>([]);
  employees = signal<any[]>([]);
  selectedEmployeeId = '';
  selectedConversationId: string | null = null;
  msgLoading = signal(false);
  messages = signal<any[]>([]);

  draft = '';
  sending = signal(false);

  myUserId = computed(() => this.authService.user()?.id || '');
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  async ngOnInit(): Promise<void> {
    effect(() => {
      if (!this.open()) return;
      void this.loadNotifications();
      void this.ensureConversationLoaded();
      void this.chatbarService.loadOverview();
    });
    await this.refresh();
  }

  async refresh(): Promise<void> {
    await this.chatbarService.loadOverview();

    // Keep notifications fresh even when chatbar is closed so badge is accurate
    if (this.open()) {
      await this.loadNotifications();
      if (this.tab() === 'messages') {
        await this.ensureConversationLoaded();
      }
    }
  }

  toggle(): void {
    this.chatbarService.toggle();
    if (this.open() ) {
      void this.loadNotifications();
      void this.ensureConversationLoaded();
      void this.chatbarService.loadOverview();
    }
  }

  setTab(t: 'notifications' | 'messages'): void {
    this.tab.set(t);
    if (this.open()) {
      if (t === 'notifications') void this.loadNotifications();
      else void this.ensureConversationLoaded();
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      this.loading.set(true);
      const list = await this.chatbarService.getMyNotifications();
      this.notifications.set(list || []);
    } finally {
      this.loading.set(false);
    }
  }

  async markAllRead(): Promise<void> {
    await this.chatbarService.markAllNotificationsRead();
    await this.loadNotifications();
    await this.chatbarService.loadOverview();
  }

  async openNotification(n: any): Promise<void> {
    if (!n.isRead) {
      await this.chatbarService.markNotificationRead(n.id);
      await this.chatbarService.loadOverview();
      // optimistic update
      this.notifications.set(this.notifications().map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
  }

  async startConversation(): Promise<void> {
    const conv = await this.chatbarService.startMyConversation();
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadMessages();
  }

  private async ensureConversationLoaded(): Promise<void> {
    if (this.conversationId()) return;

    if (this.isAdmin()) {
      await this.loadAdminLists();
      const first = (this.conversations() || [])[0];
      if (first?.id) {
        this.conversationId.set(first.id);
        this.selectedConversationId = first.id;
        await this.loadMessages();
      }
      return;
    }

    // employee: ensure conversation exists with admin
    const conv = await this.chatbarService.startMyConversation();
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadMessages();
  }

  private async loadAdminLists(): Promise<void> {
    try {
      // conversations
      const convs = await this.chatbarService.getMyConversations();
      this.conversations.set(convs || []);
      if (!this.selectedConversationId && convs?.length) {
        this.selectedConversationId = convs[0].id;
      }

      // employees for start
      await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 });
      this.employees.set(this.employeeService.employees() || []);
    } catch {
      // ignore: global interceptor will notify
    }
  }

  async startAdminConversation(): Promise<void> {
    if (!this.selectedEmployeeId) return;
    const conv = await this.chatbarService.startConversationForEmployee(this.selectedEmployeeId);
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadAdminLists();
    await this.loadMessages();
  }

  onSelectConversation(id: string): void {
    if (!id) return;
    this.conversationId.set(id);
    this.selectedConversationId = id;
    void this.loadMessages();
  }

  senderLabel(m: any): string {
    const mine = m?.senderUserId === this.myUserId();
    if (mine) return 'You';
    if (this.isAdmin()) {
      const conv = (this.conversations() || []).find((c: any) => c.id === this.conversationId());
      return conv?.employee?.name || conv?.title || 'Employee';
    }
    return 'Admin';
  }

  private async loadMessages(): Promise<void> {
    const id = this.conversationId();
    if (!id) return;
    try {
      this.msgLoading.set(true);
      const msgs = await this.chatbarService.getConversationMessages(id);
      this.messages.set(msgs || []);
      await this.chatbarService.markConversationRead(id);
      await this.chatbarService.loadOverview();
    } finally {
      this.msgLoading.set(false);
    }
  }

  async send(): Promise<void> {
    const id = this.conversationId();
    const text = String(this.draft || '').trim();
    if (!id || !text) return;
    try {
      this.sending.set(true);
      await this.chatbarService.sendMessage(id, text);
      this.draft = '';
      await this.loadMessages();
    } finally {
      this.sending.set(false);
    }
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  }
}
