import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components';
import { AuthService, AttendanceService, EmployeeService } from '../../core/services';
import type { ApiAttendance, AttendanceStatus } from '../../core/services/attendance.service';

interface MonthSummary {
  key: string;
  label: string;
  present: number;
  absent: number;
  other: number;
  trackedDays: number;
  percentage: number;
}

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="attendance-wrapper">
      <div class="page-header">
        <h1>Attendance</h1>
        <p class="subtitle" *ngIf="isAdmin(); else employeeSubtitle">
          View employee attendance percentages by month and mark daily records when needed.
        </p>
        <ng-template #employeeSubtitle>
          <p class="subtitle">Track your monthly attendance percentage and daily records.</p>
        </ng-template>
      </div>

      @if (isAdmin()) {
      <div class="analytics-grid">
        <app-card [title]="'Attendance Performance This Month'" [elevated]="true">
          <div class="pie-card">
            <div
              class="attendance-pie"
              [style.background]="currentMonthPie()"
              [attr.aria-label]="'Attendance percentage ' + currentMonthSummary().percentage + '%'"
            >
              <div class="pie-inner">
                <span class="pie-value">{{ currentMonthSummary().percentage }}%</span>
                <span class="pie-caption">{{ currentMonthSummary().label }}</span>
              </div>
            </div>

            <div class="pie-legend">
              <div class="legend-item">
                <span class="legend-dot present"></span>
                <span>Present-related: {{ currentMonthSummary().present }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot absent"></span>
                <span>Absent: {{ currentMonthSummary().absent }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot other"></span>
                <span>Other tracked: {{ currentMonthSummary().other }}</span>
              </div>
            </div>
          </div>
        </app-card>

        <app-card [title]="'Monthly Employee Attendance %'" [elevated]="true">
          <div class="month-list">
            @for (month of monthlySummaries(); track month.key) {
              <button class="month-row" [class.active]="selectedMonthKey() === month.key" (click)="selectedMonthKey.set(month.key)">
                <div>
                  <div class="month-label">{{ month.label }}</div>
                  <div class="month-meta">{{ month.trackedDays }} tracked records</div>
                </div>
                <div class="month-value">{{ month.percentage }}%</div>
              </button>
            }
          </div>

          @if (selectedMonth()) {
            <div class="selected-month-panel">
              <div class="selected-month-top">
                <div>
                  <div class="selected-title">{{ selectedMonth()!.label }}</div>
                  <div class="selected-subtitle">Attendance mix for the selected month</div>
                </div>
                <div class="selected-percentage">{{ selectedMonth()!.percentage }}%</div>
              </div>

              <div class="mix-bar">
                <span class="mix-fill present" [style.width.%]="barWidth(selectedMonth()!.present, selectedMonth()!.trackedDays)"></span>
                <span class="mix-fill other" [style.width.%]="barWidth(selectedMonth()!.other, selectedMonth()!.trackedDays)"></span>
                <span class="mix-fill absent" [style.width.%]="barWidth(selectedMonth()!.absent, selectedMonth()!.trackedDays)"></span>
              </div>
            </div>
          }
        </app-card>
      </div>
      }

      @if (isAdmin()) {
        <app-card [title]="'Mark Attendance'" [elevated]="true">
          <div class="daily-card">
            <div class="daily-top">
              <div class="daily-title">Daily Present Marking</div>
              <div class="daily-date">Date: {{ dailyDate }}</div>
            </div>

            <div class="daily-grid">
              @for (employee of employees(); track employee.id) {
                <label class="daily-item">
                  <input
                    type="checkbox"
                    [checked]="dailyPresent()[employee.id]"
                    (change)="toggleDaily(employee.id, $any($event.target).checked)"
                  />
                  <span class="daily-name">
                    {{ employee.employeeId }} - {{ employee.firstName }} {{ employee.lastName }}
                  </span>
                </label>
              }
            </div>

            <div class="form-actions" style="margin-top: 12px;">
              <button class="btn-primary" (click)="saveDailyPresent()" [disabled]="dailySaving()">
                {{ dailySaving() ? 'Saving...' : 'Save Present For Selected' }}
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-grid">
            <div class="form-group">
              <label>Employee</label>
              <select [(ngModel)]="newRecord.employeeId">
                <option value="">Select employee</option>
                @for (employee of employees(); track employee.id) {
                  <option [value]="employee.id">
                    {{ employee.employeeId }} - {{ employee.firstName }} {{ employee.lastName }}
                  </option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="newRecord.date" />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select [(ngModel)]="newRecord.status">
                @for (status of statuses; track status) {
                  <option [value]="status">{{ formatStatus(status) }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Clock In</label>
              <input type="datetime-local" [(ngModel)]="newRecord.clockIn" />
            </div>

            <div class="form-group">
              <label>Clock Out</label>
              <input type="datetime-local" [(ngModel)]="newRecord.clockOut" />
            </div>

            <div class="form-actions">
              <button class="btn-primary" (click)="markAttendance()" [disabled]="isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save Attendance' }}
              </button>
              <button class="btn-secondary" (click)="reload()" [disabled]="isLoading()">Refresh</button>
            </div>
          </div>
        </app-card>
      } @else {
        <div class="toolbar">
          <button class="btn-secondary" (click)="reload()" [disabled]="isLoading()">Refresh</button>
        </div>
      }

      <app-card [title]="isAdmin() ? 'All Attendance Records' : 'My Attendance Records'" [elevated]="true">
        @if (isLoading()) {
          <p class="muted">Loading...</p>
        } @else if (records().length === 0) {
          <p class="muted">No attendance records found.</p>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  @if (isAdmin()) {
                    <th>Employee</th>
                  }
                  <th>Date</th>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                </tr>
              </thead>
              <tbody>
                @for (record of records(); track record.id) {
                  <tr>
                    @if (isAdmin()) {
                      <td>
                        <div class="emp-cell">
                          <div class="emp-name">{{ record.employee.firstName }} {{ record.employee.lastName }}</div>
                          <div class="emp-id">{{ record.employee.employeeId }}</div>
                        </div>
                      </td>
                    }
                    <td>{{ record.date }}</td>
                    <td class="status">{{ formatStatus(record.status) }}</td>
                    <td>{{ formatDateTime(record.clockIn) }}</td>
                    <td>{{ formatDateTime(record.clockOut) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </app-card>
    </div>
  `,
  styles: [
    `
      .attendance-wrapper {
        max-width: 1400px;
      }

      .page-header {
        margin-bottom: 16px;
      }

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      .subtitle {
        margin: 6px 0 0 0;
        color: #64748b;
        font-size: 13px;
      }

      .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 18px;
        margin-bottom: 20px;
      }

      .pie-card {
        display: grid;
        grid-template-columns: minmax(180px, 220px) 1fr;
        gap: 20px;
        align-items: center;
      }

      .attendance-pie {
        width: 210px;
        height: 210px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 24px 45px rgba(37, 99, 235, 0.14);
        animation: floatIn 0.45s ease;
      }

      .pie-inner {
        width: 128px;
        height: 128px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.96);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
      }

      .pie-value {
        font-size: 32px;
        font-weight: 800;
        color: #0f172a;
      }

      .pie-caption {
        margin-top: 6px;
        font-size: 12px;
        color: #64748b;
        font-weight: 700;
      }

      .pie-legend,
      .month-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(248, 250, 252, 0.85);
        border: 1px solid rgba(226, 232, 240, 0.9);
        font-size: 13px;
        font-weight: 700;
        color: #334155;
      }

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .legend-dot.present,
      .mix-fill.present {
        background: #10b981;
      }

      .legend-dot.absent,
      .mix-fill.absent {
        background: #ef4444;
      }

      .legend-dot.other,
      .mix-fill.other {
        background: #f59e0b;
      }

      .month-row {
        border: 1px solid rgba(226, 232, 240, 0.9);
        background: rgba(248, 250, 252, 0.82);
        border-radius: 16px;
        padding: 14px 16px;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .month-row.active {
        border-color: rgba(37, 99, 235, 0.3);
        background: rgba(219, 234, 254, 0.55);
        box-shadow: 0 18px 28px rgba(37, 99, 235, 0.1);
      }

      .month-label {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }

      .month-meta {
        margin-top: 4px;
        font-size: 12px;
        color: #64748b;
      }

      .month-value,
      .selected-percentage {
        font-size: 24px;
        font-weight: 800;
        color: #1d4ed8;
      }

      .selected-month-panel {
        margin-top: 14px;
        padding: 16px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 252, 0.9));
        border: 1px solid rgba(191, 219, 254, 0.85);
      }

      .selected-month-top {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        margin-bottom: 14px;
      }

      .selected-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
      }

      .selected-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: #64748b;
      }

      .mix-bar {
        height: 14px;
        border-radius: 999px;
        overflow: hidden;
        display: flex;
        background: rgba(226, 232, 240, 0.7);
      }

      .mix-fill {
        display: block;
        height: 100%;
      }

      .toolbar {
        margin: 0 0 16px 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 14px;
        align-items: end;
      }

      .form-group label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 6px;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.85);
        outline: none;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .divider {
        height: 1px;
        background: rgba(226, 232, 240, 0.9);
        margin: 14px 0;
      }

      .daily-card {
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.82);
      }

      .daily-top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .daily-title {
        font-size: 13px;
        font-weight: 900;
        color: #0f172a;
      }

      .daily-date {
        font-size: 12px;
        font-weight: 800;
        color: #64748b;
      }

      .daily-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 10px;
        margin-top: 10px;
        max-height: 220px;
        overflow: auto;
        padding-right: 6px;
      }

      .daily-item {
        display: flex;
        gap: 10px;
        align-items: center;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 10px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        user-select: none;
      }

      .daily-name {
        font-size: 12px;
        font-weight: 800;
        color: #0f172a;
      }

      .btn-primary,
      .btn-secondary {
        border: none;
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 700;
        cursor: pointer;
      }

      .btn-primary {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #fff;
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
      }

      .btn-secondary {
        background: #e2e8f0;
        color: #0f172a;
      }

      .btn-primary:disabled,
      .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .table-wrap {
        overflow: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 10px 12px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        text-align: left;
        font-size: 13px;
      }

      .table th {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
      }

      .muted {
        color: #64748b;
        margin: 0;
      }

      .emp-cell {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }

      .emp-name {
        font-weight: 700;
        color: #0f172a;
      }

      .emp-id {
        color: #64748b;
        font-size: 12px;
      }

      .status {
        font-weight: 700;
      }

      @keyframes floatIn {
        from {
          opacity: 0;
          transform: translateY(14px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 900px) {
        .pie-card {
          grid-template-columns: 1fr;
          justify-items: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceListComponent implements OnInit {
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);

  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  isLoading = computed(() => this.attendanceService.isLoading());
  records = signal<ApiAttendance[]>([]);
  employees = signal<{ id: string; employeeId: string; firstName: string; lastName: string }[]>([]);
  isSaving = signal(false);
  selectedMonthKey = signal('');

  statuses: AttendanceStatus[] = [
    'present',
    'absent',
    'late',
    'half_day',
    'work_from_home',
    'on_leave',
    'holiday',
    'weekend',
  ];

  newRecord: {
    employeeId: string;
    date: string;
    status: AttendanceStatus;
    clockIn?: string;
    clockOut?: string;
  } = {
    employeeId: '',
    date: '',
    status: 'present',
    clockIn: '',
    clockOut: '',
  };

  dailyDate = '';
  dailyPresent = signal<Record<string, boolean>>({});
  dailySaving = signal(false);

  monthlySummaries = computed(() => this.buildMonthSummaries(this.records()));
  currentMonthSummary = computed(() => {
    const summaries = this.monthlySummaries();
    const currentMonthKey = this.monthKey(new Date());
    return (
      summaries.find((summary) => summary.key === currentMonthKey) ??
      summaries[0] ?? {
        key: currentMonthKey,
        label: this.monthLabel(currentMonthKey),
        present: 0,
        absent: 0,
        other: 0,
        trackedDays: 0,
        percentage: 0,
      }
    );
  });

  selectedMonth = computed(() => {
    const selectedKey = this.selectedMonthKey();
    return this.monthlySummaries().find((summary) => summary.key === selectedKey) ?? null;
  });

  async ngOnInit(): Promise<void> {
    const today = new Date();
    const iso = this.toIsoDate(today);
    this.newRecord.date = iso;
    this.dailyDate = iso;

    await this.reload();

    if (this.isAdmin()) {
      await this.loadEmployees();
      const map: Record<string, boolean> = {};
      for (const employee of this.employees()) {
        map[employee.id] = false;
      }
      this.dailyPresent.set(map);
    }
  }

  async reload(): Promise<void> {
    const records = this.isAdmin()
      ? await this.attendanceService.getAll()
      : await this.attendanceService.getMine();

    this.records.set(records);

    const summaries = this.buildMonthSummaries(records);
    if (summaries.length > 0) {
      this.selectedMonthKey.set(this.selectedMonthKey() || summaries[0].key);
    }
  }

  private async loadEmployees(): Promise<void> {
    await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 });
    this.employees.set(
      (this.employeeService.employees() || []).map((employee: any) => ({
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
      })),
    );
  }

  async markAttendance(): Promise<void> {
    if (!this.newRecord.employeeId || !this.newRecord.date) {
      alert('Please select employee and date.');
      return;
    }

    try {
      this.isSaving.set(true);
      await this.attendanceService.markAttendance({
        employeeId: this.newRecord.employeeId,
        date: this.newRecord.date,
        status: this.newRecord.status,
        clockIn: this.newRecord.clockIn || null,
        clockOut: this.newRecord.clockOut || null,
      });
      this.newRecord.clockIn = '';
      this.newRecord.clockOut = '';
      await this.reload();
    } finally {
      this.isSaving.set(false);
    }
  }

  toggleDaily(employeeId: string, checked: boolean): void {
    this.dailyPresent.update((current) => ({ ...current, [employeeId]: checked }));
  }

  async saveDailyPresent(): Promise<void> {
    if (!this.dailyDate) {
      return;
    }

    const selectedEmployees = Object.entries(this.dailyPresent())
      .filter(([, checked]) => checked)
      .map(([employeeId]) => employeeId);

    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    try {
      this.dailySaving.set(true);
      for (const employeeId of selectedEmployees) {
        await this.attendanceService.markAttendance({
          employeeId,
          date: this.dailyDate,
          status: 'present',
          clockIn: null,
          clockOut: null,
        });
      }

      await this.reload();
      const resetMap: Record<string, boolean> = {};
      for (const employee of this.employees()) {
        resetMap[employee.id] = false;
      }
      this.dailyPresent.set(resetMap);
    } finally {
      this.dailySaving.set(false);
    }
  }

  formatStatus(value: string | null): string {
    if (!value) {
      return '-';
    }
    return value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
  }

  formatDateTime(value: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }

  barWidth(value: number, total: number): number {
    if (!total) {
      return 0;
    }
    return Math.round((value / total) * 100);
  }

  currentMonthPie(): string {
    const summary = this.currentMonthSummary();
    const presentPct = this.barWidth(summary.present, summary.trackedDays);
    const otherPct = this.barWidth(summary.other, summary.trackedDays);
    const absentPct = Math.max(0, 100 - presentPct - otherPct);

    return `conic-gradient(
      #10b981 0 ${presentPct}%,
      #f59e0b ${presentPct}% ${presentPct + otherPct}%,
      #ef4444 ${presentPct + otherPct}% ${presentPct + otherPct + absentPct}%,
      #e2e8f0 ${presentPct + otherPct + absentPct}% 100%
    )`;
  }

  private buildMonthSummaries(records: ApiAttendance[]): MonthSummary[] {
    const groups = new Map<string, MonthSummary>();

    for (const record of records) {
      const key = this.monthKey(record.date);
      const current = groups.get(key) ?? {
        key,
        label: this.monthLabel(key),
        present: 0,
        absent: 0,
        other: 0,
        trackedDays: 0,
        percentage: 0,
      };

      const status = String(record.status || '').toLowerCase();
      if (status === 'holiday' || status === 'weekend') {
        groups.set(key, current);
        continue;
      }

      current.trackedDays += 1;

      if (['present', 'late', 'half_day', 'work_from_home'].includes(status)) {
        current.present += 1;
      } else if (status === 'absent') {
        current.absent += 1;
      } else {
        current.other += 1;
      }

      groups.set(key, current);
    }

    return [...groups.values()]
      .map((summary) => ({
        ...summary,
        percentage: summary.trackedDays
          ? Math.round((summary.present / summary.trackedDays) * 100)
          : 0,
      }))
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 12);
  }

  private monthKey(value: string | Date): string {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private monthLabel(key: string): string {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, (month || 1) - 1, 1).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  private toIsoDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
