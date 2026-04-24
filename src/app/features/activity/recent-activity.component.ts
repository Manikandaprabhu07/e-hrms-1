import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../shared/components';
import { DashboardService } from '../../core/services';

interface Activity {
  id: string;
  user: string;
  action: string;
  type: 'leave' | 'join' | 'approve' | 'update';
  timeAgo: string;
  image?: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, CardComponent, RouterModule],
  template: `
    <div class="page-header">
      <h1>Recent Activity</h1>
      <p class="subtitle">A complete activity feed for the last few days.</p>
      <button class="btn-primary" (click)="refresh()">Refresh</button>
    </div>

    <main class="dashboard-main">
      <app-card [title]="'Activity Feed'" [elevated]="true">
        <div class="activity-list">
          @for (activity of activities(); track activity.id) {
            <div class="activity-item">
              <img [src]="activity.image" [alt]="activity.user" class="activity-avatar" />
              <div class="activity-info">
                <p class="activity-text">
                  <strong>{{ activity.user }}</strong> {{ activity.action }}
                </p>
                <p class="activity-time">{{ activity.timeAgo }}</p>
              </div>
              <span class="activity-badge" [class]="'badge-' + activity.type">
                {{ activity.type | titlecase }}
              </span>
            </div>
          }
          @if (activities().length === 0) {
            <p class="muted">No activity yet.</p>
          }
        </div>
      </app-card>
    </main>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      .subtitle {
        margin: 8px 0 12px 0;
        font-size: 14px;
        color: #64748b;
      }

      .dashboard-main {
        max-width: 900px;
      }

      .btn-primary {
        padding: 10px 14px;
        border: none;
        border-radius: 6px;
        background: #1e40af;
        color: white;
        cursor: pointer;
        font-weight: 600;
        margin-top: 12px;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .activity-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: rgba(249, 250, 251, 0.7);
        border-radius: 6px;
        align-items: center;
      }

      .activity-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .activity-info {
        flex: 1;
        min-width: 0;
      }

      .activity-text {
        margin: 0;
        font-size: 13px;
        color: #1a1a1a;
        line-height: 1.4;
      }

      .activity-time {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: #999;
      }

      .activity-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .badge-leave {
        background: #fff3cd;
        color: #856404;
      }

      .badge-join {
        background: #d1ecf1;
        color: #0c5460;
      }

      .badge-approve {
        background: #d4edda;
        color: #155724;
      }

      .badge-update {
        background: #e2e3e5;
        color: #383d41;
      }

      .muted {
        color: #64748b;
        font-size: 13px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivityComponent {
  private dashboardService = inject(DashboardService);

  activities = signal<Activity[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh() {
    const data = await this.dashboardService.getAdminDashboard();
    this.activities.set(data.recentActivities || []);
  }
}
