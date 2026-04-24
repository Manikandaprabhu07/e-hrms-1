import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../core/services';
import { CardComponent, LoadingSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, CardComponent, LoadingSpinnerComponent],
  template: `
    <div class="feedback-container">
      <div class="page-header">
        <h1>Feedback</h1>
        <p class="subtitle">Employee feedback received by admin</p>
      </div>

      <app-card [elevated]="true">
        <app-loading-spinner [isLoading]="isLoading()" message="Loading feedback..." />

        @if (!isLoading() && items().length === 0) {
          <p class="muted">No feedback received yet.</p>
        }

        @if (!isLoading() && items().length > 0) {
          <div class="list">
            @for (f of items(); track f.id) {
              <div class="item">
                <div class="top">
                  <div class="who">
                    <div class="name">{{ employeeName(f) }}</div>
                    <div class="meta">{{ employeeId(f) }}</div>
                  </div>
                  <div class="time">{{ f.createdAt ? (f.createdAt | date:'medium') : '' }}</div>
                </div>
                <div class="msg">{{ f.message }}</div>
              </div>
            }
          </div>
        }
      </app-card>
    </div>
  `,
  styles: [`
    .feedback-container { padding: 0; }

    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1e293b; }
    .subtitle { margin: 8px 0 0 0; font-size: 14px; color: #64748b; }

    .muted { color: #64748b; font-size: 13px; }

    .list { display: flex; flex-direction: column; gap: 12px; }
    .item {
      border: 1px solid rgba(226,232,240,0.9);
      background: rgba(255,255,255,0.85);
      border-radius: 12px;
      padding: 12px 12px;
    }
    .top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .name { font-weight: 900; color: #0f172a; font-size: 14px; }
    .meta { font-size: 12px; color: #64748b; font-weight: 700; margin-top: 2px; }
    .time { font-size: 12px; color: #64748b; white-space: nowrap; }
    .msg { margin-top: 10px; color: #0f172a; font-size: 13px; white-space: pre-wrap; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackListComponent implements OnInit {
  private feedbackService = inject(FeedbackService);

  isLoading = signal(true);
  items = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      const list = await this.feedbackService.getAll();
      this.items.set(list || []);
    } finally {
      this.isLoading.set(false);
    }
  }

  employeeName(f: any): string {
    const e = f?.employee || {};
    return `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Unknown';
  }

  employeeId(f: any): string {
    const e = f?.employee || {};
    return e.employeeId || e.id || '-';
  }
}

