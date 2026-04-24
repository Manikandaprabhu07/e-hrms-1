 import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, DashboardService, EventService, FeedbackService, EmployeeService, LeaveService, TrainingService, AttendanceService } from '../../core/services';
import { CardComponent } from '../../shared/components';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  type: 'leave' | 'join' | 'approve' | 'update';
  timeAgo: string;
  image?: string;
}

interface QuickAction {
  title: string;
  icon: string;
  action: () => void;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule, RouterModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back, {{ user()?.firstName }}! Here's what's happening today.</p>
      </div>

      <!-- Main Content -->
      <main class="dashboard-main">
        
        @if (isAdmin()) {
          <!-- ADMIN DASHBOARD -->
          <section class="stats-section">
            <div class="stats-grid">
              @for (stat of kpiStats(); track stat.title) {
                <div class="kpi-card" [style.border-left-color]="stat.color">
                  <div class="kpi-header">
                    <span class="kpi-icon">{{ stat.icon }}</span>
                    <span class="kpi-title">{{ stat.title }}</span>
                  </div>
                  <div class="kpi-value">{{ stat.value }}</div>
                </div>
              }
            </div>
          </section>

          <div class="dashboard-grid">
            <!-- Pending Leave Requests -->
            <section class="leave-section">
              <app-card [title]="'Pending Leave Requests'" [elevated]="true">
                <p class="section-subtitle">{{ pendingLeaves().length }} requests awaiting approval</p>
                @if (pendingLeaves().length > 0) {
                  <div class="leaves-list">
                    @for (leave of pendingLeaves().slice(0, 3); track leave.id) {
                      <div class="leave-item" role="button" tabindex="0" (click)="goToLeave()">
                        <img [src]="leave.image" [alt]="leave.name" class="leave-avatar" />
                        <div class="leave-info">
                          <h4>{{ leave.name }}</h4>
                          <p class="leave-type">{{ leave.department }} · {{ leave.leaveType }}</p>
                          <p class="leave-dates">{{ leave.startDate }} - {{ leave.endDate }} ({{ leave.days }} days)</p>
                        </div>
                        <div class="leave-actions">
                          <button class="btn-approve" (click)="approveLeave(leave.id); $event.stopPropagation()">✓</button>
                          <button class="btn-reject" (click)="rejectLeave(leave.id); $event.stopPropagation()">✕</button>
                        </div>
                      </div>
                    }
                  </div>
                  @if (pendingLeaves().length > 3) {
                    <a class="view-all-link" [routerLink]="['/leave']">View all →</a>
                  }
                }
              </app-card>
            </section>

            <!-- Recent Activity -->
            <section class="activity-section">
              <app-card [title]="'Recent Activity'" [elevated]="true">
                <button type="button" class="view-all-link" (click)="goToActivity()">View all →</button>
                <div class="activity-list">
                  @if (recentActivities().length === 0) {
                    <p class="muted">No recent activity to show.</p>
                  } @else {
                    @for (activity of recentActivities().slice(0, 4); track activity.id) {
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
                  }
                </div>
              </app-card>
            </section>
          </div>

          <!-- Quick Actions -->
          <section class="quick-actions-section">
            <h2>Quick Actions</h2>
            <div class="quick-actions-grid">
              @for (action of adminQuickActions(); track action.title) {
                <button (click)="action.action()" class="quick-action-btn">
                  <span class="action-icon">{{ action.icon }}</span>
                  <span class="action-title">{{ action.title }}</span>
                </button>
              }
            </div>
          </section>

          <div class="dashboard-grid-bottom">
            <section class="events-section">
              <app-card [title]="'Upcoming Events'" [elevated]="true">
                <button type="button" class="view-all-link" (click)="goToCalendar()">View calendar →</button>
                <div class="events-list">
                  @if (upcomingEvents().length === 0) {
                    <p class="muted">No upcoming events scheduled.</p>
                  } @else {
                    @for (event of upcomingEvents(); track event.id) {
                      <div class="event-item">
                        <span class="event-icon">📅</span>
                        <div class="event-info">
                          <h4>{{ event.title || event.name }}</h4>
                          <p>{{ event.date }}</p>
                          @if (event.description) {
                            <p class="muted" style="margin:4px 0 0 0; font-size:12px;">{{ event.description }}</p>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>

                @if (isAdmin()) {
                  <div class="event-add-form">
                    <h4 style="margin: 12px 0 8px 0;">Add event</h4>
                    <input type="text" placeholder="Title" [(ngModel)]="newEventTitle" />
                    <input type="date" [(ngModel)]="newEventDate" />
                    <textarea rows="2" placeholder="Description (optional)" [(ngModel)]="newEventDescription"></textarea>
                    <button class="btn-primary" (click)="createEvent()" [disabled]="isCreatingEvent">
                      {{ isCreatingEvent ? 'Adding…' : 'Add event' }}
                    </button>
                  </div>
                }
              </app-card>
            </section>

            <section class="department-section">
              <app-card [title]="'Employees by Department'" [elevated]="true">
                <div class="department-visual">
                  <button class="department-pie" [style.background]="departmentPieGradient()" (click)="clearDepartmentSelection()">
                    <div class="department-pie-center">
                      <span class="pie-value">
                        {{ selectedDepartment()?.percentage ?? 100 }}%
                      </span>
                      <span class="pie-label">
                        {{ selectedDepartment()?.name || 'All Teams' }}
                      </span>
                    </div>
                  </button>

                  <div class="department-list">
                    @for (dept of departmentData(); track dept.name) {
                      <button class="department-item" [class.active]="selectedDepartmentName() === dept.name" (click)="selectDepartment(dept.name)">
                        <div class="dept-info">
                          <span class="dept-icon" [style.background]="dept.color"></span>
                          <div>
                            <h4>{{ dept.name }}</h4>
                            <p>{{ dept.count }} employees</p>
                          </div>
                        </div>
                        <div class="dept-bar">
                          <div class="dept-bar-fill" [style.width.%]="dept.percentage" [style.background]="dept.color"></div>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              </app-card>
            </section>
          </div>
        } @else {
          <!-- EMPLOYEE DASHBOARD -->
          <section class="stats-section">
            <div class="stats-grid">
              <div class="kpi-card" style="border-left-color: #28a745">
                <div class="kpi-header">
                  <span class="kpi-icon">📅</span>
                  <span class="kpi-title">Pending Leaves</span>
                </div>
                <div class="kpi-value">{{ employeeDashboard().leaveSummary.pending }}</div>
                <div class="kpi-trend positive">
                  <span class="trend-text">Awaiting approval</span>
                </div>
              </div>
              <div class="kpi-card" style="border-left-color: #007bff">
                <div class="kpi-header">
                  <span class="kpi-icon">🌴</span>
                  <span class="kpi-title">Approved Leaves</span>
                </div>
                <div class="kpi-value">{{ employeeDashboard().leaveSummary.approved }}</div>
                <div class="trend-text">Approved this year</div>
              </div>
              <div class="kpi-card" style="border-left-color: #ffc107">
                <div class="kpi-header">
                  <span class="kpi-icon">⏰</span>
                  <span class="kpi-title">Rejected Leaves</span>
                </div>
                <div class="kpi-value">{{ employeeDashboard().leaveSummary.rejected }}</div>
                <div class="trend-text">Rejected requests</div>
              </div>
            </div>
          </section>

          <!-- Employee Details + Actions -->
          <div class="dashboard-grid">
            <section class="profile-section">
              <app-card [title]="'My Profile'" [elevated]="true">
                @if (myEmployee()) {
                  <div class="profile-card">
                    <div class="profile-photo-wrap">
                      <img
                        class="profile-photo"
                        [src]="myEmployee().profilePhoto || myEmployee().avatar || getDashboardAvatar(myEmployee())"
                        [alt]="myEmployee().firstName"
                      />
                    </div>

                    <div class="profile-grid">
                      <div class="profile-item">
                        <div class="label">Employee ID</div>
                        <div class="value">{{ myEmployee().employeeId }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Name</div>
                        <div class="value">{{ myEmployee().firstName }} {{ myEmployee().lastName }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Email</div>
                        <div class="value">{{ myEmployee().email }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Phone</div>
                        <div class="value">{{ myEmployee().phone || '-' }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Department</div>
                        <div class="value">{{ myEmployee().department }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Designation</div>
                        <div class="value">{{ myEmployee().designation }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Date Of Joining</div>
                        <div class="value">{{ myEmployee().dateOfJoining ? (myEmployee().dateOfJoining | date:'mediumDate') : '-' }}</div>
                      </div>
                      <div class="profile-item">
                        <div class="label">Employment Status</div>
                        <div class="value">{{ myEmployee().employmentStatus || '-' }}</div>
                      </div>
                    </div>
                  </div>
                } @else {
                  <p class="muted">Loading profile...</p>
                }
              </app-card>
            </section>

            <section class="events-section">
              <app-card [title]="'Upcoming Events'" [elevated]="true">
                <button type="button" class="view-all-link" (click)="goToCalendar()">View calendar →</button>
                <div class="events-list">
                  @if (upcomingEvents().length === 0) {
                    <p class="muted">No upcoming events.</p>
                  } @else {
                    @for (event of upcomingEvents().slice(0, 3); track event.id) {
                      <div class="event-item">
                        <span class="event-icon">📅</span>
                        <div class="event-info">
                          <h4>{{ event.title || event.name }}</h4>
                          <p>{{ event.date }}</p>
                          @if (event.description) {
                            <p class="muted" style="margin:4px 0 0 0; font-size:12px;">{{ event.description }}</p>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              </app-card>
            </section>

            <section class="attendance-summary-section">
              <app-card [title]="'My Attendance This Month'" [elevated]="true">
                <div class="employee-attendance-card">
                  <div class="employee-attendance-pie" [style.background]="employeeAttendancePieGradient()">
                    <div class="employee-attendance-center">
                      <span class="employee-attendance-value">{{ employeeAttendanceSummary().percentage }}%</span>
                      <span class="employee-attendance-label">{{ employeeAttendanceSummary().label }}</span>
                    </div>
                  </div>

                  <div class="employee-attendance-legend">
                    <div class="legend-row">
                      <span class="legend-swatch present"></span>
                      <span>Present-related: {{ employeeAttendanceSummary().present }}</span>
                    </div>
                    <div class="legend-row">
                      <span class="legend-swatch other"></span>
                      <span>Other tracked: {{ employeeAttendanceSummary().other }}</span>
                    </div>
                    <div class="legend-row">
                      <span class="legend-swatch absent"></span>
                      <span>Absent: {{ employeeAttendanceSummary().absent }}</span>
                    </div>
                  </div>
                </div>
              </app-card>
            </section>

            <section class="training-section">
              <app-card [title]="'My Trainings (Active)'" [elevated]="true">
                @if (myTrainings().length === 0) {
                  <p class="muted">No active trainings assigned.</p>
                } @else {
                  <div class="training-list">
                    @for (t of myTrainings().slice(0, 4); track t.assignmentId) {
                      <div class="training-item">
                        <div class="training-top">
                          <div>
                            <div class="training-title">{{ t.title }}</div>
                            <div class="training-meta">Trainer: {{ t.trainer }} · {{ t.duration }}</div>
                          </div>
                          <div class="training-pct">{{ t.progress }}%</div>
                        </div>
                        <div class="training-bar">
                          <div class="training-fill" [style.width.%]="t.progress"></div>
                        </div>
                      </div>
                    }
                    <button class="btn-link" (click)="goTraining()">View all trainings →</button>
                  </div>
                }
              </app-card>
            </section>

             <!-- Quick Actions & Feedback -->
             <div class="employee-sidebar-col">
              <section class="quick-actions-section">
                <app-card [title]="'Quick Actions'" [elevated]="true">
                  <div class="quick-actions-grid-sm">
                    <button class="quick-action-btn" (click)="requestLeave()">
                      <span class="action-icon">✈️</span>
                      <span class="action-title">Request Leave</span>
                    </button>
                    <button class="quick-action-btn" (click)="viewPayslip()">
                      <span class="action-icon">📄</span>
                      <span class="action-title">View Payslip</span>
                    </button>
                  </div>
                </app-card>
              </section>

              <section class="feedback-section" style="margin-top: 24px;">
                <app-card [title]="'Send Feedback'" [elevated]="true">
                  <div class="feedback-form">
                    <textarea 
                      [(ngModel)]="feedbackMessage" 
                      placeholder="Share your thoughts, suggestions or concerns anonymously..."
                      rows="4"></textarea>
                    <button class="btn-primary full-width" (click)="sendFeedback()">Send Feedback</button>
                  </div>
                </app-card>
              </section>
             </div>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100%;
      background: transparent;
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

    .dashboard-main {
      max-width: 1400px;
    }

    /* KPI Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .kpi-icon {
      font-size: 20px;
    }

    .kpi-title {
      font-size: 13px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
    }

    .kpi-value {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #999;
    }

    .kpi-trend.positive {
      color: #28a745;
    }

    .kpi-trend.negative {
      color: #dc3545;
    }

    .trend-arrow {
      font-weight: bold;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .leave-section,
    .activity-section,
    .notices-section {
      /* Avoid huge empty gaps when there is little/no content. */
      min-height: auto;
    }

    .section-subtitle {
      margin: 0 0 16px 0;
      font-size: 13px;
      color: #666;
    }

    /* Leaves List */
    .leaves-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .leave-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(249, 250, 251, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: flex-start;
    }

    .leave-item[role="button"] {
      cursor: pointer;
    }

    .leave-item[role="button"]:hover {
      background: rgba(249, 250, 251, 0.9);
    }

    .leave-avatar,
    .activity-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .leave-info {
      flex: 1;
      min-width: 0;
    }

    .leave-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .leave-type {
      margin: 2px 0;
      font-size: 12px;
      color: #666;
    }

    .leave-dates {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .leave-actions {
      display: flex;
      gap: 6px;
    }

    .btn-approve,
    .btn-reject {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;
    }

    .btn-approve {
      background: #28a745;
      color: white;
    }

    .btn-approve:hover {
      background: #218838;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
    }

    .btn-reject:hover {
      background: #c82333;
    }

    /* Activity List */
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
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: center;
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

    /* Quick Actions */
    .quick-actions-section {
      margin-bottom: 32px;
    }

    .quick-actions-section h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .quick-actions-grid-sm {
       display: grid;
       grid-template-columns: 1fr 1fr;
       gap: 12px;
    }

    .quick-action-btn {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(224, 224, 224, 0.5);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      font-size: 13px;
      font-weight: 600;
      width: 100%;
    }

    .quick-action-btn:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 24px;
    }

    .action-title {
      color: #1a1a1a;
    }

    /* Dashboard Bottom Grid */
    .dashboard-grid-bottom {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    /* Events */
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(249, 250, 251, 0.7);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      border-radius: 6px;
      align-items: center;
    }

    .event-icon {
      font-size: 24px;
    }

    .event-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .event-info p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .event-add-form {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .event-add-form input,
    .event-add-form textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-top: 8px;
      font-size: 13px;
    }

    .event-add-form textarea {
      resize: vertical;
    }

    .event-add-form button {
      margin-top: 10px;
      width: 100%;
    }

    /* Departments */
    .department-visual {
      display: grid;
      grid-template-columns: 230px 1fr;
      gap: 22px;
      align-items: center;
    }

    .department-pie {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 44px rgba(37, 99, 235, 0.14);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .department-pie:hover {
      transform: scale(1.02);
      box-shadow: 0 26px 56px rgba(37, 99, 235, 0.2);
    }

    .department-pie-center {
      width: 126px;
      height: 126px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.96);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
    }

    .pie-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
    }

    .pie-label {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      max-width: 86px;
    }

    .department-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .department-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 16px;
      padding: 14px;
      background: rgba(248, 250, 252, 0.72);
      cursor: pointer;
      text-align: left;
    }

    .department-item.active {
      border-color: rgba(37, 99, 235, 0.35);
      background: rgba(219, 234, 254, 0.48);
      box-shadow: 0 16px 30px rgba(37, 99, 235, 0.12);
      transform: translateY(-2px);
    }

    .dept-info {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .dept-icon {
      display: inline-flex;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.9);
    }

    .dept-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .dept-info p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .dept-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .dept-bar-fill {
      height: 100%;
      transition: width 0.3s;
    }

    @media (max-width: 920px) {
      .department-visual {
        grid-template-columns: 1fr;
        justify-items: center;
      }
    }

    /* View All Links */
    .view-all-link {
      display: inline-block;
      margin-bottom: 16px;
      color: #007bff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: color 0.3s;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .view-all-link:hover {
      color: #0056b3;
    }

    /* Notices */
    .notices-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .notice-item {
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid #ccc;
      background: #f8fafc;
    }

    .notice-info { border-left-color: #3b82f6; background: #eff6ff; }
    .notice-warning { border-left-color: #f59e0b; background: #fffbeb; }
    .notice-success { border-left-color: #10b981; background: #ecfdf5; }

    .notice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .notice-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .notice-date {
      font-size: 12px;
      color: #64748b;
    }

    .notice-item p {
      margin: 0;
      font-size: 13px;
      color: #334155;
    }

    .muted {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }

    .profile-card {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 18px;
      align-items: start;
    }

    .profile-photo-wrap {
      display: flex;
      justify-content: center;
    }

    .profile-photo {
      width: 108px;
      height: 108px;
      border-radius: 24px;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.92);
      box-shadow: 0 18px 36px rgba(37, 99, 235, 0.14);
      background: #e2e8f0;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .profile-item .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 700;
    }

    .profile-item .value {
      margin-top: 4px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }

    .training-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .employee-attendance-card {
      display: grid;
      grid-template-columns: 190px 1fr;
      gap: 20px;
      align-items: center;
    }

    .employee-attendance-pie {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 18px 40px rgba(37, 99, 235, 0.14);
    }

    .employee-attendance-center {
      width: 112px;
      height: 112px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.96);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.9);
    }

    .employee-attendance-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
    }

    .employee-attendance-label {
      margin-top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-align: center;
    }

    .employee-attendance-legend {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .legend-row {
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

    .legend-swatch {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-swatch.present { background: #10b981; }
    .legend-swatch.other { background: #f59e0b; }
    .legend-swatch.absent { background: #ef4444; }

    .training-item {
      padding: 12px;
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 10px;
      background: rgba(255,255,255,0.7);
    }

    .training-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .training-title {
      font-weight: 800;
      color: #0f172a;
      font-size: 13px;
      margin-bottom: 2px;
    }

    .training-meta {
      font-size: 12px;
      color: #64748b;
    }

    .training-pct {
      font-weight: 900;
      color: #0f172a;
      font-size: 12px;
      white-space: nowrap;
    }

    .training-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
    }

    .training-fill {
      height: 100%;
      background: #3b82f6;
    }

    .btn-link {
      border: none;
      background: transparent;
      padding: 0;
      text-align: left;
      color: #2563eb;
      font-weight: 800;
      cursor: pointer;
      font-size: 13px;
      margin-top: 6px;
    }

    /* Feedback Form */
    .feedback-form textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 12px;
    }

    .feedback-form textarea:focus {
      outline: none;
      border-color: #3b82f6;
      ring: 2px solid #eff6ff;
    }

    .btn-primary.full-width {
      width: 100%;
      background: #1e40af;
      color: white;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .btn-primary:hover {
      background: #1e3a8a;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .dashboard-main {
        padding: 16px;
      }

      .stats-grid,
      .quick-actions-grid,
      .dashboard-grid,
      .dashboard-grid-bottom {
        grid-template-columns: 1fr;
      }

      .profile-card {
        grid-template-columns: 1fr;
      }

      .employee-attendance-card {
        grid-template-columns: 1fr;
        justify-items: center;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private feedbackService = inject(FeedbackService);
  private employeeService = inject(EmployeeService);
  private eventService = inject(EventService);
  private leaveService = inject(LeaveService);
  private trainingService = inject(TrainingService);
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);

  user = this.authService.user;
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  feedbackMessage = '';

  // Event creation state (admin-only)
  newEventTitle = '';
  newEventDate = '';
  newEventDescription = '';
  isCreatingEvent = false;

  notices = signal<Notice[]>([]);

  adminDashboard = signal<any>({
    totals: {
      totalEmployees: 0,
      newHiresThisYear: 0,
      exitsThisYear: 0,
      employeesJoiningThisQuarter: 0,
      employeesRelievingThisQuarter: 0,
    },
    departmentCounts: [],
    pendingLeaveRequests: []
  });

  employeeDashboard = signal<any>({
    leaveSummary: { pending: 0, approved: 0, rejected: 0 }
  });
  employeeAttendanceSummary = signal({
    present: 0,
    absent: 0,
    other: 0,
    trackedDays: 0,
    percentage: 0,
    label: 'This month'
  });

  myEmployee = signal<any | null>(null);
  myTrainings = signal<any[]>([]);

  kpiStats = computed(() => {
    const totals = this.adminDashboard().totals || {};
    return [
      {
        title: 'Total Employees',
        value: totals.totalEmployees ?? 0,
        icon: 'EMP',
        color: '#007bff'
      },
      {
        title: 'New Hires (This Year)',
        value: totals.newHiresThisYear ?? 0,
        icon: 'NEW',
        color: '#17a2b8'
      },
      {
        title: 'Employee Exits (This Year)',
        value: totals.exitsThisYear ?? 0,
        icon: 'EXIT',
        color: '#dc3545'
      }
    ];
  });

  pendingLeaves = computed(() => {
    const leaves = this.adminDashboard().pendingLeaveRequests || [];
    return leaves.map((leave: any) => {
      const employee = leave.employee || {};
      const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
      return {
        id: leave.id,
        name,
        department: employee.department || '-',
        leaveType: leave.leaveType || 'Leave',
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: this.calculateDays(leave.startDate, leave.endDate),
        image: employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff`
      };
    });
  });

  recentActivities = signal<Activity[]>([]);

  upcomingEvents = signal<any[]>([]);
  selectedDepartmentName = signal<string | null>(null);

  departmentData = computed(() => {
    const counts = this.adminDashboard().departmentCounts || [];
    const total = counts.reduce((sum: number, item: any) => sum + Number(item.count || 0), 0) || 1;
    const palette = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    return counts.map((item: any, index: number) => ({
      name: item.department,
      count: Number(item.count || 0),
      percentage: Math.round((Number(item.count || 0) / total) * 100),
      icon: 'DEPT',
      color: palette[index % palette.length]
    }));
  });

  selectedDepartment = computed(() => {
    const selectedName = this.selectedDepartmentName();
    return this.departmentData().find((dept: any) => dept.name === selectedName) || null;
  });

  adminQuickActions = (): QuickAction[] => [
    { title: 'Add Employee', icon: '+', action: () => this.router.navigate(['/employees/new']) },
    { title: 'Manage Leave', icon: 'L', action: () => this.router.navigate(['/leave']) },
    { title: 'Attendance', icon: 'A', action: () => this.router.navigate(['/attendance']) },
    { title: 'Payroll', icon: 'P', action: () => this.router.navigate(['/payroll']) },
  ];

  ngOnInit() {
    if (this.isAdmin()) {
      this.loadAdminDashboard();
    } else {
      this.loadEmployeeDashboard();
    }
  }

  requestLeave() {
    this.router.navigate(['/leave'], { queryParams: { request: 1 } });
  }

  viewPayslip() {
    this.router.navigate(['/payroll'], { queryParams: { openLatest: 1 } });
  }

  async sendFeedback() {
    if (this.feedbackMessage.trim()) {
      await this.feedbackService.sendFeedback(this.feedbackMessage.trim());
      this.feedbackMessage = '';
    } else {
      alert('Please enter a message before sending.');
    }
  }

  async createEvent() {
    if (!this.newEventTitle.trim() || !this.newEventDate.trim()) {
      alert('Please provide both a title and a date for the event.');
      return;
    }

    this.isCreatingEvent = true;
    try {
      await this.eventService.createEvent({
        title: this.newEventTitle.trim(),
        date: this.newEventDate,
        description: this.newEventDescription.trim() || undefined,
      });
      this.newEventTitle = '';
      this.newEventDate = '';
      this.newEventDescription = '';
      await this.loadAdminDashboard();
    } finally {
      this.isCreatingEvent = false;
    }
  }

  private formatTimeAgo(dateString: string | Date): string {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  private async loadAdminDashboard(): Promise<void> {
    const data = await this.dashboardService.getAdminDashboard();
    this.adminDashboard.set(data);

    const activities = (data.recentActivities || []).map((a: any) => ({
      ...a,
      timeAgo: this.formatTimeAgo(a.timeAgo || a.updatedAt || new Date().toISOString()),
    }));

    this.recentActivities.set(
      activities.length
        ? activities
        : [
            { id: 'nothing', user: '—', action: 'No recent activity yet', type: 'update', timeAgo: '' },
          ]
    );

    this.upcomingEvents.set(data.upcomingEvents || []);
  }

  private async loadEmployeeDashboard(): Promise<void> {
    const data = await this.dashboardService.getEmployeeDashboard();
    this.employeeDashboard.set(data);
    this.upcomingEvents.set(data.upcomingEvents || []);

    try {
      const emp = await this.employeeService.getMe();
      this.myEmployee.set(emp as any);
    } catch {
      this.myEmployee.set(null);
    }

    try {
      const trainings = await this.trainingService.loadMyAssignments();
      this.myTrainings.set(trainings || []);
    } catch {
      this.myTrainings.set([]);
    }

    try {
      const records = await this.attendanceService.getMine();
      this.employeeAttendanceSummary.set(this.buildCurrentMonthAttendance(records || []));
    } catch {
      this.employeeAttendanceSummary.set({
        present: 0,
        absent: 0,
        other: 0,
        trackedDays: 0,
        percentage: 0,
        label: 'This month'
      });
    }
  }

  async approveLeave(id: string): Promise<void> {
    await this.leaveService.approveLeaveRequest(id);
    await this.loadAdminDashboard();
  }

  async rejectLeave(id: string): Promise<void> {
    await this.leaveService.rejectLeaveRequest(id);
    await this.loadAdminDashboard();
  }

  goToLeave(): void {
    this.router.navigate(['/leave']);
  }

  goToActivity(): void {
    this.router.navigate(['/activity']);
  }

  goToCalendar(): void {
    this.router.navigate(['/events']);
  }

  goTraining(): void {
    this.router.navigate(['/training']);
  }

  selectDepartment(name: string): void {
    this.selectedDepartmentName.update((current) => (current === name ? null : name));
  }

  clearDepartmentSelection(): void {
    this.selectedDepartmentName.set(null);
  }

  departmentPieGradient(): string {
    const selected = this.selectedDepartment();
    if (selected) {
      return `conic-gradient(${selected.color} 0 ${selected.percentage}%, #e2e8f0 ${selected.percentage}% 100%)`;
    }

    const departments = this.departmentData();
    if (departments.length === 0) {
      return 'conic-gradient(#cbd5e1 0 100%)';
    }

    const total = departments.reduce((sum: number, dept: any) => sum + Number(dept.count || 0), 0) || 1;
    let current = 0;
    const segments = departments.map((dept: any, index: number) => {
      const start = current;
      const exactPercentage =
        index === departments.length - 1
          ? 100 - current
          : (Number(dept.count || 0) / total) * 100;
      current += exactPercentage;
      const end = index === departments.length - 1 ? 100 : current;
      return `${dept.color} ${start}% ${end}%`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  private calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
  }

  employeeAttendancePieGradient(): string {
    const summary = this.employeeAttendanceSummary();
    const total = summary.trackedDays || 1;
    const presentPct = Math.round((summary.present / total) * 100);
    const otherPct = Math.round((summary.other / total) * 100);
    const absentPct = Math.max(0, 100 - presentPct - otherPct);
    return `conic-gradient(#10b981 0 ${presentPct}%, #f59e0b ${presentPct}% ${presentPct + otherPct}%, #ef4444 ${presentPct + otherPct}% ${presentPct + otherPct + absentPct}%, #e2e8f0 ${presentPct + otherPct + absentPct}% 100%)`;
  }

  private buildCurrentMonthAttendance(records: any[]) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const summary = {
      present: 0,
      absent: 0,
      other: 0,
      trackedDays: 0,
      percentage: 0,
      label: now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    };

    for (const record of records) {
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime()) || date.getMonth() !== month || date.getFullYear() !== year) {
        continue;
      }

      const status = String(record.status || '').toLowerCase();
      if (status === 'holiday' || status === 'weekend') {
        continue;
      }

      summary.trackedDays += 1;
      if (['present', 'late', 'half_day', 'work_from_home'].includes(status)) {
        summary.present += 1;
      } else if (status === 'absent') {
        summary.absent += 1;
      } else {
        summary.other += 1;
      }
    }

    summary.percentage = summary.trackedDays ? Math.round((summary.present / summary.trackedDays) * 100) : 0;
    return summary;
  }

  getDashboardAvatar(employee: any): string {
    const name = `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || 'Employee';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff`;
  }
}




