import { Component, ChangeDetectionStrategy, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../shared/components';
import { LeaveService, AuthService } from '../../core/services';

interface LeaveRequest {
  id: string;
  employeeId?: string;
  employeeName: string;
  employeeAvatar: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  appliedAtMs: number;
}

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="management-container">
      <div class="page-header">
        <h1>Leave Management</h1>
        <p class="subtitle">
          {{ leaveRequests().length }} {{ isAdmin() ? 'leave requests to manage' : 'leave requests' }}
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending">📋</div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pending Requests</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon approved">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Approved</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon rejected">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ rejectedCount() }}</span>
            <span class="stat-label">Rejected</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ leaveRequests().length }}</span>
            <span class="stat-label">Total Requests</span>
          </div>
        </div>
      </div>

      @if (!isAdmin() && latestLeave()) {
        <app-card [elevated]="true">
          <div class="latest-leave">
            <div class="latest-title">Latest Leave Request</div>
            <div class="latest-meta">
              <span class="latest-pill">{{ latestLeave()!.leaveType }}</span>
              <span class="latest-pill">{{ latestLeave()!.startDate }} → {{ latestLeave()!.endDate }}</span>
              <span class="latest-pill status" [class]="latestLeave()!.status.toLowerCase()">{{ latestLeave()!.status }}</span>
            </div>
            <div class="latest-reason">{{ latestLeave()!.reason }}</div>
          </div>
        </app-card>
      }

      <app-card [elevated]="true">
        <div class="table-header">
          <h3>Leave Requests</h3>
          @if (!isAdmin()) {
            <button class="btn btn-primary" (click)="toggleRequestForm()">
              {{ showRequestForm() ? 'Close Form' : '+ Request Leave' }}
            </button>
          }
        </div>

        @if (!isAdmin() && showRequestForm()) {
          <div class="leave-request-form">
            <div class="form-row">
              <div class="form-group">
                <label>Leave Type</label>
                <input class="form-input" [(ngModel)]="newLeave.leaveType" placeholder="Annual / Sick / Casual" />
              </div>
              <div class="form-group">
                <label>Start Date</label>
                <input class="form-input" type="date" [(ngModel)]="newLeave.startDate" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input class="form-input" type="date" [(ngModel)]="newLeave.endDate" />
              </div>
            </div>
            <div class="form-group">
              <label>Reason</label>
              <input class="form-input" [(ngModel)]="newLeave.reason" placeholder="Reason" />
            </div>
            <button class="btn btn-primary" (click)="submitLeaveRequest()">Submit Leave Request</button>
          </div>
        }

        <div class="leave-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (leave of leaveRequests(); track leave.id) {
                <tr>
                  <td>
                    <div class="employee-info">
                      <img [src]="leave.employeeAvatar" [alt]="leave.employeeName" class="avatar" />
                      @if (isAdmin()) {
                        <button type="button" class="employee-name-link" (click)="goToEmployee(leave.employeeId); $event.stopPropagation()">
                          {{ leave.employeeName }}
                        </button>
                      } @else {
                        <span class="employee-name">{{ leave.employeeName }}</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="leave-type-badge" [class]="leave.leaveType.toLowerCase()">
                      {{ leave.leaveType }}
                    </span>
                  </td>
                  <td>
                    <div class="date-range">
                      <span>{{ leave.startDate }}</span>
                      <span class="date-separator">→</span>
                      <span>{{ leave.endDate }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="days-badge">{{ leave.days }} days</span>
                  </td>
                  <td>
                    <span class="reason-text">{{ leave.reason }}</span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="leave.status.toLowerCase()">
                      {{ leave.status }}
                    </span>
                  </td>
                  <td>
                    @if (isAdmin()) {
                      @if (leave.status === 'Pending') {
                        <button class="btn btn-sm btn-success" (click)="approveLeave(leave.id)">Approve</button>
                        <button class="btn btn-sm btn-danger" (click)="rejectLeave(leave.id)">Reject</button>
                        <button class="btn btn-sm btn-secondary" (click)="openDetails(leave)">View</button>
                      } @else {
                        <button class="btn btn-sm btn-secondary" (click)="openDetails(leave)">View</button>
                      }
                    } @else {
                      <button class="btn btn-sm btn-secondary" (click)="openDetails(leave)">View</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      @if (selectedLeave()) {
        <div class="details-backdrop" (click)="closeDetails()">
          <div class="details-modal" (click)="$event.stopPropagation()">
            <div class="details-header">
              <div>
                <div class="details-title">Leave Details</div>
                <div class="details-subtitle">{{ selectedLeave()!.employeeName }}</div>
              </div>
              <button class="close-btn" (click)="closeDetails()">Close</button>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Leave Type</span>
                <span class="detail-value">{{ selectedLeave()!.leaveType }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">{{ selectedLeave()!.status }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Start Date</span>
                <span class="detail-value">{{ selectedLeave()!.startDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">End Date</span>
                <span class="detail-value">{{ selectedLeave()!.endDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">{{ selectedLeave()!.days }} days</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Applied On</span>
                <span class="detail-value">{{ selectedLeave()!.appliedOn || '-' }}</span>
              </div>
            </div>

            <div class="detail-note">
              <span class="detail-label">Reason</span>
              <p>{{ selectedLeave()!.reason }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .management-container {
      padding: 0;
    }

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
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      animation: liftIn 0.45s ease;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-icon.pending { background: #fef3c7; }
    .stat-icon.approved { background: #dcfce7; }
    .stat-icon.rejected { background: #fee2e2; }
    .stat-icon.total { background: #e0f2fe; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
    }

    /* Table Header */
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .leave-table {
      overflow-x: auto;
      animation: liftIn 0.55s ease;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background-color: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    .employee-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .employee-name {
      font-weight: 600;
      color: #1e293b;
    }

    .employee-name-link {
      border: none;
      background: transparent;
      padding: 0;
      font: inherit;
      font-weight: 700;
      color: #1e293b;
      cursor: pointer;
      text-align: left;
    }

    .employee-name-link:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .leave-type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .leave-type-badge.annual { background: #dbeafe; color: #1e40af; }
    .leave-type-badge.sick { background: #fee2e2; color: #dc2626; }
    .leave-type-badge.personal { background: #f3e8ff; color: #7c3aed; }
    .leave-type-badge.maternity { background: #fce7f3; color: #be185d; }
    .leave-type-badge.paternity { background: #e0f2fe; color: #0369a1; }

    .date-range {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #374151;
    }

    .date-separator {
      color: #9ca3af;
    }

    .days-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #f3f4f6;
      color: #374151;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .reason-text {
      font-size: 13px;
      color: #64748b;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #b45309;
    }

    .status-badge.approved {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.rejected {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      margin-right: 6px;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .btn-success {
      background: #16a34a;
      color: white;
    }

    .btn-success:hover {
      background: #15803d;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .latest-leave {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .latest-title {
      font-weight: 700;
      color: #1e293b;
    }

    .latest-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .latest-pill {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 999px;
      background: #eef2ff;
      color: #3730a3;
      font-size: 12px;
      font-weight: 600;
    }

    .latest-pill.status.pending { background: #fef3c7; color: #92400e; }
    .latest-pill.status.approved { background: #dcfce7; color: #166534; }
    .latest-pill.status.rejected { background: #fee2e2; color: #991b1b; }

    .latest-reason {
      color: #475569;
      font-size: 13px;
    }

    .leave-request-form {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f8fafc;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-input {
      padding: 8px 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
    }

    .details-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1200;
      backdrop-filter: blur(8px);
    }

    .details-modal {
      width: min(680px, 100%);
      background: rgba(255, 255, 255, 0.98);
      border-radius: 22px;
      padding: 24px;
      box-shadow: 0 30px 70px rgba(15, 23, 42, 0.22);
      animation: modalIn 0.2s ease;
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    .details-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .details-subtitle {
      margin-top: 4px;
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
    }

    .close-btn {
      border: none;
      border-radius: 999px;
      background: #e2e8f0;
      color: #0f172a;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .detail-item,
    .detail-note {
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(239, 246, 255, 0.8));
      padding: 14px 16px;
    }

    .detail-label {
      display: block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }

    .detail-value {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .detail-note p {
      margin: 0;
      color: #334155;
      line-height: 1.6;
      font-size: 14px;
    }

    @keyframes liftIn {
      from {
        opacity: 0;
        transform: translateY(16px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(12px);
      }

      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  leaveRequests = signal<LeaveRequest[]>([]);
  selectedLeave = signal<LeaveRequest | null>(null);
  latestLeave = computed(() => this.leaveRequests()[0] || null);
  showRequestForm = signal(false);
  newLeave = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  };

  pendingCount = signal(0);
  approvedCount = signal(0);
  rejectedCount = signal(0);

  ngOnInit(): void {
    const request = this.route.snapshot.queryParamMap.get('request');
    if (request === '1' && !this.isAdmin()) {
      this.showRequestForm.set(true);
    }
    this.loadLeaves();
  }

  private async loadLeaves(): Promise<void> {
    const leaves = this.isAdmin()
      ? await this.leaveService.getAll()
      : await this.leaveService.getMy();
    const mapped = (leaves || []).map((leave: any) => {
      const employee = leave.employee || {};
      const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
      return {
        id: leave.id,
        employeeId: employee.id,
        employeeName,
        employeeAvatar: employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName || 'User')}&background=1e40af&color=fff`,
        leaveType: leave.leaveType || 'Leave',
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: this.calculateDays(leave.startDate, leave.endDate),
        reason: leave.reason || '-',
        status: leave.status || 'Pending',
        appliedOn: leave.createdAt ? new Date(leave.createdAt).toISOString().split('T')[0] : '',
        appliedAtMs: leave.createdAt ? new Date(leave.createdAt).getTime() : 0
      } as LeaveRequest;
    });
    mapped.sort((a, b) => {
      return b.appliedAtMs - a.appliedAtMs;
    });
    this.leaveRequests.set(mapped);
    this.updateCounts(mapped);
  }

  private calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
  }

  updateCounts(leaves: LeaveRequest[]): void {
    this.pendingCount.set(leaves.filter(l => l.status === 'Pending').length);
    this.approvedCount.set(leaves.filter(l => l.status === 'Approved').length);
    this.rejectedCount.set(leaves.filter(l => l.status === 'Rejected').length);
  }

  async approveLeave(id: string): Promise<void> {
    await this.leaveService.approveLeaveRequest(id);
    await this.loadLeaves();
  }

  async rejectLeave(id: string): Promise<void> {
    await this.leaveService.rejectLeaveRequest(id);
    await this.loadLeaves();
  }

  async submitLeaveRequest(): Promise<void> {
    if (!this.newLeave.leaveType || !this.newLeave.startDate || !this.newLeave.endDate) {
      alert('Please fill required fields.');
      return;
    }
    await this.leaveService.requestLeave({
      leaveType: this.newLeave.leaveType,
      startDate: this.newLeave.startDate,
      endDate: this.newLeave.endDate,
      reason: this.newLeave.reason,
      status: 'Pending'
    } as any);
    this.newLeave = { leaveType: '', startDate: '', endDate: '', reason: '' };
    this.showRequestForm.set(false);
    await this.loadLeaves();
  }

  toggleRequestForm(): void {
    this.showRequestForm.update((value) => !value);
  }

  openDetails(leave: LeaveRequest): void {
    this.selectedLeave.set(leave);
  }

  closeDetails(): void {
    this.selectedLeave.set(null);
  }

  goToEmployee(employeeId?: string): void {
    if (employeeId) {
      this.router.navigate(['/employees', employeeId]);
    }
  }
}
