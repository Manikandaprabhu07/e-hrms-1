import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, EmployeeStatus, EmploymentType, WorkLocationType } from '../../core/models';
import { CardComponent } from '../../shared/components';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  template: `
    <div class="employee-detail-container" *ngIf="employee() as emp">
      <!-- Header / Profile Summary -->
      <div class="profile-header card-glass">
        <div class="profile-info-main">
          <div class="profile-avatar">
            <img [src]="emp.profilePhoto || emp.avatar || 'https://ui-avatars.com/api/?name=' + emp.firstName + '+' + emp.lastName" [alt]="emp.firstName">
          </div>
          <div class="profile-meta">
            <h1>{{ emp.firstName }} {{ emp.lastName }}</h1>
            <div class="meta-badges">
              <span class="badge" [class]="'badge-' + emp.employmentStatus">{{ emp.employmentStatus | uppercase }}</span>
              <span class="badge badge-secondary">{{ emp.designation }}</span>
              <span class="badge badge-outline">{{ emp.employeeId }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" [routerLink]="['/employees', emp.id, 'edit']">
            <span>✏️ Edit Profile</span>
          </button>
          <button class="btn btn-outline" (click)="onBack()">
            <span>← Back to List</span>
          </button>
        </div>
      </div>

      <!-- Main Content / Tabs -->
      <div class="detail-content-grid">
        <!-- Sidebar Navigation -->
        <div class="detail-sidebar card-glass">
          <div class="nav-item" [class.active]="activeTab() === 'personal'" (click)="activeTab.set('personal')">
            <span>👤 Personal Information</span>
          </div>
          <div class="nav-item" [class.active]="activeTab() === 'employment'" (click)="activeTab.set('employment')">
            <span>💼 Employment Details</span>
          </div>
          <div class="nav-item" [class.active]="activeTab() === 'documents'" (click)="activeTab.set('documents')">
            <span>📄 Documents Vault</span>
          </div>
          <div class="nav-item" [class.active]="activeTab() === 'payroll'" (click)="activeTab.set('payroll')">
            <span>💰 Payroll & Salary</span>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Info -->
          <div *ngIf="activeTab() === 'personal'">
            <app-card [title]="'Personal Information'" [elevated]="true">
              <div class="info-grid">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>{{ emp.firstName }} {{ emp.lastName }}</span>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <span>{{ emp.email }}</span>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <span>{{ emp.phone || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <span>{{ emp.gender || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>{{ emp.dateOfBirth | date:'mediumDate' }}</span>
                </div>
                <div class="info-item">
                  <label>Nationality</label>
                  <span>{{ emp.nationality || 'N/A' }}</span>
                </div>
                <div class="info-item full-width">
                  <label>Residential Address</label>
                  <span>{{ emp.address || 'N/A' }}</span>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Employment Details -->
          <div *ngIf="activeTab() === 'employment'">
            <app-card [title]="'Employment Details'" [elevated]="true">
              <div class="info-grid">
                <div class="info-item">
                  <label>Department</label>
                  <span>{{ emp.department }}</span>
                </div>
                <div class="info-item">
                  <label>Designation</label>
                  <span>{{ emp.designation }}</span>
                </div>
                <div class="info-item">
                  <label>Employment Type</label>
                  <span>{{ emp.employmentType | uppercase }}</span>
                </div>
                <div class="info-item">
                  <label>Work Location</label>
                  <span>{{ emp.workLocation || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Joining</label>
                  <span>{{ emp.dateOfJoining | date:'longDate' }}</span>
                </div>
                <div class="info-item">
                  <label>Reporting Manager</label>
                  <span>{{ emp.reportingManager || 'No Manager Assigned' }}</span>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Documents Vault -->
          <div *ngIf="activeTab() === 'documents'">
            <app-card [title]="'Documents Vault'" [elevated]="true">
              @if (employeeDocuments().length > 0) {
                <div class="document-list">
                  @for (doc of employeeDocuments(); track doc.id) {
                    <a class="document-item" [href]="doc.dataUrl" [download]="doc.name" target="_blank" rel="noopener">
                      <div>
                        <div class="document-name">{{ doc.name }}</div>
                        <div class="document-meta">{{ doc.category }}</div>
                      </div>
                      <span class="document-action">Download</span>
                    </a>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <div class="icon">Files</div>
                  <p>No documents uploaded yet.</p>
                </div>
              }
            </app-card>
          </div>

          <!-- Payroll -->
          <div *ngIf="activeTab() === 'payroll'">
            <app-card [title]="'Payroll & Salary Structure'" [elevated]="true">
              <div class="info-grid">
                <div class="info-item">
                  <label>Annual Salary (CTC)</label>
                  <span class="salary-text">₹{{ emp.salary.toLocaleString('en-IN') }}</span>
                </div>
                <div class="info-item">
                  <label>Bank Name</label>
                  <span>HDFC Bank (Masked)</span>
                </div>
                <div class="info-item">
                  <label>Account Number</label>
                  <span>**** **** 4567</span>
                </div>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="isLoading()">
      <div class="spinner"></div>
      <p>Fetching employee profile...</p>
    </div>
  `,
  styles: [`
    .employee-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header Styling */
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
    }

    .profile-info-main {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .profile-avatar img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .profile-meta h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 800;
      color: #1e293b;
      letter-spacing: -0.02em;
    }

    .meta-badges {
      display: flex;
      gap: 8px;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-on_leave { background: #fef9c3; color: #a16207; }
    .badge-secondary { background: #e2e8f0; color: #475569; }
    .badge-outline { border: 1px solid #e2e8f0; color: #64748b; }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Grid Layout */
    .detail-content-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
    }

    /* Sidebar Nav */
    .detail-sidebar {
      padding: 12px;
      border-radius: 16px;
      height: fit-content;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-item {
      padding: 14px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      color: #64748b;
      transition: all 0.2s;
      margin-bottom: 4px;
    }

    .nav-item:hover {
      background: rgba(59, 130, 246, 0.05);
      color: #3b82f6;
    }

    .nav-item.active {
      background: #3b82f6;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    /* Tab Content Styling */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      padding: 12px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
    }

    .salary-text {
      font-size: 24px !important;
      font-weight: 700 !important;
      color: #10b981 !important;
    }

    /* Button Styles */
    .btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }

    .btn-outline { background: white; color: #64748b; border: 1px solid #e2e8f0; }
    .btn-outline:hover { background: #f8fafc; color: #1e293b; }

    .btn-outline-sm { padding: 6px 12px; font-size: 12px; background: transparent; border: 1px dashed #cbd5e1; }

    /* Misc */
    .empty-state {
      padding: 64px 24px;
      text-align: center;
      color: #94a3b8;
    }

    .empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }

    .document-list {
      display: grid;
      gap: 14px;
    }

    .document-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 18px;
      border-radius: 14px;
      text-decoration: none;
      background: rgba(248, 250, 252, 0.9);
      border: 1px solid rgba(226, 232, 240, 0.9);
      color: inherit;
    }

    .document-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .document-meta {
      margin-top: 4px;
      font-size: 12px;
      color: #64748b;
      text-transform: capitalize;
    }

    .document-action {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      white-space: nowrap;
    }

    .loading-state {
      height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #64748b;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .detail-content-grid { grid-template-columns: 1fr; }
      .profile-header { flex-direction: column; text-align: center; gap: 24px; }
      .profile-info-main { flex-direction: column; }
      .info-grid { grid-template-columns: 1fr; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  employee = signal<Employee | null>(null);
  isLoading = signal(true);
  activeTab = signal('personal');
  employeeDocuments = computed(() => {
    const employee = this.employee() as any;
    return Array.isArray(employee?.documents) ? employee.documents : [];
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const emp = await this.employeeService.getEmployeeById(id);
        this.employee.set(emp);
      } catch (error) {
        console.error('Error loading employee:', error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.router.navigate(['/employees']);
    }
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }
}
