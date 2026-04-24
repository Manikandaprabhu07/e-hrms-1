import { Component, ChangeDetectionStrategy, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingService, AuthService } from '../../core/services';
import { LoadingSpinnerComponent, CardComponent } from '../../shared/components';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
    selector: 'app-training-list',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CardComponent],
    template: `
    <div class="training-container">
      <div class="page-header">
        <h1>Training & Development</h1>
        <p class="subtitle">Manage employee training programs and workshops</p>
      </div>

      <app-card [elevated]="true">
        <app-loading-spinner [isLoading]="isLoading()" message="Loading training sessions..." />

        @if (isAdmin()) {
          <div class="admin-toolbar">
            <button class="btn btn-primary" (click)="showForm.set(!showForm())">
              {{ showForm() ? 'Close' : '+ Add Training' }}
            </button>
          </div>

          @if (showForm()) {
            <div class="form-grid">
              <div class="form-group">
                <label>Title</label>
                <input [(ngModel)]="form.title" />
              </div>
              <div class="form-group">
                <label>Trainer</label>
                <input [(ngModel)]="form.trainer" />
              </div>
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" [(ngModel)]="form.startDate" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" [(ngModel)]="form.endDate" />
              </div>
              <div class="form-group">
                <label>Department (optional)</label>
                <input [(ngModel)]="form.targetDepartment" placeholder="Engineering" />
              </div>
              <div class="form-group">
                <label>Role/Designation (optional)</label>
                <input [(ngModel)]="form.targetRole" placeholder="Developer" />
              </div>
              <div class="form-group full">
                <label>Description</label>
                <textarea [(ngModel)]="form.description" rows="2"></textarea>
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" (click)="createTraining()">Save</button>
                <button class="btn btn-secondary" (click)="resetForm()">Reset</button>
              </div>
            </div>
          }

          @if (!isLoading() && sessions().length > 0) {
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Training Title</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Participants</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (session of sessions(); track session.id) {
                  <tr>
                    <td>
                      <div class="session-info">
                        <span class="session-title">{{ session.title }}</span>
                        <span class="session-desc">{{ session.description || 'No description' }}</span>
                      </div>
                    </td>
                    <td>{{ session.trainer }}</td>
                    <td>{{ session.date | date:'mediumDate' }}</td>
                    <td>{{ session.duration }}</td>
                    <td>
                      <div class="participants-progress">
                        <div class="progress-info">
                          <span>{{ session.enrolledCount }}/{{ session.maxParticipants }}</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-fill" [style.width.%]="(session.enrolledCount / session.maxParticipants) * 100"></div>
                        </div>
                      </div>
                    </td>
                    <td>{{ session.location || 'Online' }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(session.status)">
                        {{ session.status }}
                      </span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button class="btn btn-sm btn-primary" (click)="openDetails(session)">Details</button>
                        <button class="btn btn-sm btn-secondary" (click)="openAssignModal(session)">Assign</button>
                        <button class="btn btn-sm btn-secondary" (click)="deleteTraining(session)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          } @else if (!isLoading()) {
            <p class="text-center text-muted">No training sessions found</p>
          }
        } @else {
          @if (!isLoading() && myAssignments().length > 0) {
            <div class="employee-grid">
              @for (a of myAssignments(); track a.assignmentId) {
                <div class="employee-card">
                  <div class="card-title">{{ a.title }}</div>
                  <div class="card-meta">Trainer: {{ a.trainer }} · {{ a.duration }}</div>
                  <div class="card-desc">{{ a.description || 'No description' }}</div>

                  <div class="progress-row">
                    <div class="progress-label">{{ a.progress }}%</div>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="a.progress"></div>
                    </div>
                  </div>

                  <div class="actions-row">
                    <input type="range" min="0" max="100" [(ngModel)]="a.progress" />
                    <button class="btn btn-primary btn-sm" (click)="saveProgress(a)">Update</button>
                    <button class="btn btn-secondary btn-sm" (click)="markComplete(a)">Complete</button>
                    <button class="btn btn-secondary btn-sm" (click)="openDetails(a)">Details</button>
                  </div>
                </div>
              }
            </div>
          } @else if (!isLoading()) {
            <p class="text-center text-muted">No active trainings assigned</p>
          }
        }
      </app-card>
    </div>

    @if (details(); as d) {
      <div class="details-backdrop" (click)="closeDetails()"></div>
      <div class="details-modal">
        <div class="details-header">
          <div>
            <div class="details-title">{{ d.title }}</div>
            <div class="details-subtitle">Trainer: {{ d.trainer }}</div>
          </div>
          <button class="icon-btn" (click)="closeDetails()">x</button>
        </div>

        <div class="details-body">
          <div class="drow">
            <div class="label">Start</div>
            <div class="value">{{ (d.startDate || d.date) | date:'mediumDate' }}</div>
          </div>
          <div class="drow">
            <div class="label">End</div>
            <div class="value">{{ (d.endDate || d.startDate || d.date) | date:'mediumDate' }}</div>
          </div>
          <div class="drow">
            <div class="label">Duration</div>
            <div class="value">{{ d.duration }}</div>
          </div>
          <div class="drow">
            <div class="label">Location</div>
            <div class="value">{{ d.location || 'Online' }}</div>
          </div>
          <div class="drow">
            <div class="label">Status</div>
            <div class="value">{{ d.status || '-' }}</div>
          </div>
          <div class="drow">
            <div class="label">Department</div>
            <div class="value">{{ d.targetDepartment || '-' }}</div>
          </div>
          <div class="drow">
            <div class="label">Role</div>
            <div class="value">{{ d.targetRole || '-' }}</div>
          </div>
          <div class="drow">
            <div class="label">Description</div>
            <div class="value">{{ d.description || '-' }}</div>
          </div>

          @if (isAdmin() && detailsAssignments().length > 0) {
            <div class="divider"></div>
            <div class="block-title">Employee Progress</div>
            <div class="assignments">
              @for (a of detailsAssignments(); track a.id) {
                <div class="assign">
                  <div class="left">
                    <div class="aname">{{ a.employee?.firstName }} {{ a.employee?.lastName }}</div>
                    <div class="ameta">{{ a.employee?.employeeId || '-' }}</div>
                  </div>
                  <div class="right">
                    <div class="astatus">{{ a.status }}</div>
                    <div class="aprog">{{ a.progress }}%</div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }

    @if (assignTraining(); as training) {
      <div class="details-backdrop" (click)="closeAssignModal()"></div>
      <div class="assign-modal">
        <div class="details-header">
          <div>
            <div class="details-title">Assign Training</div>
            <div class="details-subtitle">{{ training.title }}</div>
          </div>
          <button class="icon-btn" (click)="closeAssignModal()">x</button>
        </div>

        <div class="assign-body">
          <label for="employee-select">Choose employee</label>
          <select
            id="employee-select"
            class="assign-select"
            [ngModel]="selectedEmployeeId()"
            (ngModelChange)="selectedEmployeeId.set($event)"
          >
            <option value="">Select an employee</option>
            @for (employee of employees(); track employee.id) {
              <option [value]="employee.id">
                {{ employee.firstName }} {{ employee.lastName }} ({{ employee.employeeId }}) - {{ employee.department }}
              </option>
            }
          </select>

          <div class="assign-help">
            Assigned employees will appear in training participation and employee progress.
          </div>

          <div class="form-actions">
            <button
              class="btn btn-primary"
              [disabled]="!selectedEmployeeId() || isAssigning()"
              (click)="assignToEmployees(training)"
            >
              {{ isAssigning() ? 'Assigning...' : 'Assign Employee' }}
            </button>
            <button class="btn btn-secondary" [disabled]="isAssigning()" (click)="closeAssignModal()">Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .training-container {
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

    .table-responsive {
      width: 100%;
      height: calc(100vh - 180px); /* Fixed height */
      overflow-y: auto;
      overflow-x: auto;
      display: block;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e2e8f0;
    }

    table {
      border-collapse: collapse;
      min-width: 1400px;
      width: 100%;
      background: white;
      border: none;
      table-layout: fixed;
    }
    
    /* Column Widths */
    th:nth-child(1), td:nth-child(1) { width: 250px; } /* Title */
    th:nth-child(2), td:nth-child(2) { width: 200px; } /* Trainer */
    th:nth-child(3), td:nth-child(3) { width: 130px; } /* Date */
    th:nth-child(4), td:nth-child(4) { width: 120px; } /* Duration */
    th:nth-child(5), td:nth-child(5) { width: 180px; } /* Participants */
    th:nth-child(6), td:nth-child(6) { width: 150px; } /* Location */
    th:nth-child(7), td:nth-child(7) { width: 120px; } /* Status */
    th:nth-child(8), td:nth-child(8) { width: 280px; } /* Actions */

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Allow action buttons to wrap and not get ellipsized */
    td:nth-child(8) {
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    th {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #cbd5e1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    tr:hover td {
      background-color: #f9fafb;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      max-width: 250px;
    }

    .session-title {
      font-weight: 600;
      color: #1e293b;
      white-space: normal;
    }

    .session-desc {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .participants-progress {
      width: 120px;
    }

    .progress-info {
      font-size: 12px;
      margin-bottom: 4px;
      color: #64748b;
      text-align: right;
    }

    .progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 3px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.upcoming {
      background: #eff6ff;
      color: #2563eb;
    }

    .status-badge.completed {
      background: #f1f5f9;
      color: #475569;
    }

    .status-badge.inprogress {
      background: #fff7ed;
      color: #ea580c;
    }

    .status-badge.ongoing {
      background: #fff7ed;
      color: #ea580c;
    }

    .status-badge.cancelled {
      background: #fef2f2;
      color: #dc2626;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .text-center {
      text-align: center;
      padding: 40px;
    }

    .text-muted {
      color: #64748b;
    }

    .admin-toolbar { display:flex; justify-content:flex-end; margin-bottom: 12px; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      padding: 12px 0 18px 0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 12px;
    }

    .form-group label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px; }
    .form-group input, .form-group textarea {
      width:100%;
      padding:10px 12px;
      border:1px solid #e2e8f0;
      border-radius:8px;
      background: rgba(255,255,255,0.9);
      outline:none;
    }
    .form-group.full { grid-column: 1 / -1; }
    .form-actions { display:flex; gap:10px; align-items:center; }

    .employee-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
    .employee-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      background: rgba(255,255,255,0.85);
    }
    .card-title { font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .card-meta { font-size: 12px; color: #64748b; margin-bottom: 10px; }
    .card-desc { font-size: 13px; color: #334155; margin-bottom: 12px; }
    .progress-row { display:flex; gap:10px; align-items:center; margin-bottom: 10px; }
    .progress-label { font-weight: 800; color: #0f172a; width: 44px; text-align: right; }
    .progress-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 999px; overflow:hidden; }
    .progress-fill { height: 100%; background: #3b82f6; }
    .actions-row { display:flex; gap: 10px; align-items:center; }
    .actions-row input[type="range"] { flex: 1; }

    .details-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.25);
      z-index: 300;
    }

    .details-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(720px, calc(100vw - 32px));
      background: rgba(255,255,255,0.96);
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 14px;
      z-index: 350;
      box-shadow: 0 25px 55px rgba(0,0,0,0.18);
      overflow: hidden;
    }

    .assign-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(560px, calc(100vw - 32px));
      background: rgba(255,255,255,0.98);
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 18px;
      z-index: 350;
      box-shadow: 0 25px 55px rgba(0,0,0,0.18);
      overflow: hidden;
    }

    .assign-body {
      padding: 18px 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .assign-body label {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .assign-select {
      width: 100%;
      min-height: 48px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #0f172a;
      padding: 0 12px;
      outline: none;
    }

    .assign-help {
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
    }

    .details-header {
      display:flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(226,232,240,0.9);
    }

    .details-title { font-weight: 900; color: #0f172a; font-size: 16px; }
    .details-subtitle { margin-top: 4px; font-size: 12px; color: #64748b; font-weight: 800; }
    .icon-btn { border: none; background: transparent; font-size: 18px; cursor: pointer; color: #334155; font-weight: 900; }

    .details-body { padding: 14px 14px; display:flex; flex-direction: column; gap: 10px; }
    .drow { display:flex; justify-content: space-between; gap: 12px; }
    .drow .label { font-size: 12px; color: #64748b; font-weight: 900; }
    .drow .value { font-size: 13px; color: #0f172a; font-weight: 800; text-align: right; max-width: 430px; }

    .divider { height: 1px; background: rgba(226,232,240,0.9); margin: 8px 0; }
    .block-title { font-size: 12px; font-weight: 900; color: #0f172a; }
    .assignments { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
    .assign {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 10px;
      padding: 10px 10px;
      background: rgba(255,255,255,0.85);
    }
    .aname { font-size: 13px; font-weight: 900; color: #0f172a; }
    .ameta { font-size: 12px; color: #64748b; font-weight: 800; margin-top: 2px; }
    .right { text-align: right; }
    .astatus { font-size: 12px; font-weight: 900; color: #0f172a; }
    .aprog { font-size: 12px; font-weight: 900; color: #2563eb; margin-top: 2px; }

    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }
    .btn-secondary:hover { background: #cbd5e1; }
    .btn-sm { padding: 6px 10px; font-size: 12px; }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingListComponent implements OnInit {
    private trainingService = inject(TrainingService);
    private authService = inject(AuthService);
    private employeeService = inject(EmployeeService);

    sessions = this.trainingService.sessions;
    myAssignments = this.trainingService.myAssignments;
    isLoading = this.trainingService.isLoading;
    isAdmin = computed(() => this.authService.hasRole('ADMIN'));
    employees = this.employeeService.employees;

    showForm = signal(false);
    details = signal<any | null>(null);
    detailsAssignments = signal<any[]>([]);
    assignTraining = signal<any | null>(null);
    selectedEmployeeId = signal('');
    isAssigning = signal(false);
    form = {
      title: '',
      description: '',
      trainer: '',
      startDate: '',
      endDate: '',
      targetDepartment: '',
      targetRole: '',
      isActive: true,
    };

    ngOnInit(): void {
        if (this.isAdmin()) {
          this.trainingService.loadSessions();
          this.employeeService.getEmployees({
            pageNumber: 1,
            pageSize: 500,
          }).catch(() => void 0);
        } else {
          this.trainingService.loadMyAssignments();
        }
    }

    getStatusClass(status: string): string {
        return status.toLowerCase().replace(' ', '');
    }

    async openDetails(item: any): Promise<void> {
      this.details.set(item || null);
      this.detailsAssignments.set([]);

      // Admin: load per-employee progress for this training
      if (this.isAdmin() && item?.id) {
        try {
          const list = await this.trainingService.getAssignmentsForTraining(item.id);
          this.detailsAssignments.set(list || []);
        } catch {
          this.detailsAssignments.set([]);
        }
      }
    }

    closeDetails(): void {
      this.details.set(null);
      this.detailsAssignments.set([]);
    }

    openAssignModal(session: any): void {
      this.assignTraining.set(session || null);
      this.selectedEmployeeId.set('');
    }

    closeAssignModal(): void {
      if (this.isAssigning()) return;
      this.assignTraining.set(null);
      this.selectedEmployeeId.set('');
    }

    async assignToEmployees(session: any): Promise<void> {
      if (!session?.id || !this.selectedEmployeeId()) return;

      this.isAssigning.set(true);
      try {
        await this.trainingService.assignEmployees(session.id, [this.selectedEmployeeId()]);
        await this.trainingService.loadSessions();

        if (this.details()?.id === session.id) {
          const list = await this.trainingService.getAssignmentsForTraining(session.id);
          this.detailsAssignments.set(list || []);
        }

        this.closeAssignModal();
      } finally {
        this.isAssigning.set(false);
      }
    }

    async deleteTraining(session: any): Promise<void> {
      if (!session?.id) return;
      const ok = confirm(`Delete training "${session.title}"?`);
      if (!ok) return;
      await this.trainingService.deleteTraining(session.id);
      await this.trainingService.loadSessions();
      if (this.details()?.id === session.id) {
        this.closeDetails();
      }
    }

    async createTraining(): Promise<void> {
      if (!this.form.title || !this.form.trainer || !this.form.startDate || !this.form.endDate) {
        alert('Title, Trainer, Start Date, End Date are required.');
        return;
      }
      const created = await this.trainingService.createTraining({
        title: this.form.title,
        description: this.form.description,
        trainer: this.form.trainer,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        status: 'Upcoming',
        isActive: true,
        targetDepartment: this.form.targetDepartment || null,
        targetRole: this.form.targetRole || null,
      });
      if (created?.id) {
        await this.trainingService.backfillAssignments(created.id).catch(() => void 0);
      }
      this.resetForm();
      await this.trainingService.loadSessions();
    }

    resetForm(): void {
      this.form = {
        title: '',
        description: '',
        trainer: '',
        startDate: '',
        endDate: '',
        targetDepartment: '',
        targetRole: '',
        isActive: true,
      };
      this.showForm.set(false);
    }

    async saveProgress(a: any): Promise<void> {
      await this.trainingService.updateMyProgress(a.assignmentId, Number(a.progress || 0));
      await this.trainingService.loadMyAssignments();
    }

    async markComplete(a: any): Promise<void> {
      await this.trainingService.updateMyProgress(a.assignmentId, 100);
      await this.trainingService.loadMyAssignments();
    }
}
