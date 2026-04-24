import { Component, ChangeDetectionStrategy, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService, AuthService } from '../../core/services';
import { LoadingSpinnerComponent, CardComponent } from '../../shared/components';
import { EmployeeImportPreview, EmployeeStatus, WorkLocationType, EmploymentType } from '../../core/models';

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, CardComponent, FormsModule],
  template: `
    <div class="employees-container">
      <div class="page-header">
          <div class="header-content">
          <div>
            <h1>Employee Directory</h1>
            <p class="subtitle">{{ filteredEmployeeCount() }} of {{ employeeCount() }} employees</p>
          </div>
          @if (isAdmin()) {
            <div class="header-actions">
              <input
                #excelInput
                type="file"
                accept=".xlsx,.xls"
                class="hidden-file-input"
                (change)="onExcelFileSelected($event)"
              />
              <button class="btn btn-secondary upload-btn" (click)="excelInput.click()" [disabled]="isUploadingPreview() || isSavingImport()">
                {{ isUploadingPreview() ? 'Uploading...' : 'Upload Excel' }}
              </button>
              <button class="btn btn-primary add-btn" (click)="addEmployee()">
                <span>+</span> Add Employee
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Search and Filters -->
      <app-card [elevated]="true" class="filters-card">
        <div class="filters-container">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search by name, ID, or email..." 
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          
          <div class="filter-controls">
            <select [(ngModel)]="filterDepartment" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR & Admin">HR & Admin</option>
            </select>

            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="resigned">Resigned</option>
              <option value="probation">Probation</option>
            </select>

            <select [(ngModel)]="filterEmploymentType" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="part_time">Part Time</option>
              <option value="intern">Intern</option>
            </select>

            <button class="btn btn-secondary export-btn" (click)="exportEmployees()" [disabled]="isExporting()">
              {{ isExporting() ? 'Preparing Excel...' : 'Export Excel' }}
            </button>
          </div>
        </div>
      </app-card>

      @if (previewData().length > 0) {
        <app-card [elevated]="true" class="preview-card">
          <div class="preview-header">
            <div>
              <h2>Employee Import Preview</h2>
              <p class="preview-subtitle">{{ previewData().length }} employee records ready to import</p>
            </div>
            <div class="preview-actions">
              <button class="btn btn-secondary" (click)="clearPreview()" [disabled]="isSavingImport()">Clear</button>
              <button class="btn btn-primary save-btn" (click)="saveImportedEmployees()" [disabled]="isSavingImport()">
                {{ isSavingImport() ? 'Saving...' : 'Save Employees' }}
              </button>
            </div>
          </div>

          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                @for (employee of previewData(); track employee.employeeId + employee.email) {
                  <tr>
                    <td><span class="employee-id">{{ employee.employeeId }}</span></td>
                    <td>{{ employee.firstName }} {{ employee.lastName }}</td>
                    <td>{{ employee.email }}</td>
                    <td><span class="dept-badge">{{ employee.department }}</span></td>
                    <td>{{ employee.designation }}</td>
                    <td><span class="salary">₹{{ employee.salary | number:'1.0-2' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

      <app-card [elevated]="true">
        <app-loading-spinner [isLoading]="isLoading()" message="Loading employees..." />
        
        @if (!isLoading() && filteredEmployees().length > 0) {
          <div class="employees-table">
            <table>
              <thead>
                <tr>
                  <th (click)="sortBy('employeeId')" class="sortable">
                    Employee ID {{ getSortIcon('employeeId') }}
                  </th>
                  <th (click)="sortBy('firstName')" class="sortable">
                    Name {{ getSortIcon('firstName') }}
                  </th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th (click)="sortBy('designation')" class="sortable">
                    Designation {{ getSortIcon('designation') }}
                  </th>
                  <th (click)="sortBy('department')" class="sortable">
                    Department {{ getSortIcon('department') }}
                  </th>
                  <th>Employment Type</th>
                  <th>Work Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (employee of paginatedEmployees(); track employee.id) {
                  <tr>
                    <td>
                      <span class="employee-id">{{ employee.employeeId || 'EMP' + employee.id.substring(0, 4) }}</span>
                    </td>
                    <td>
                      <div class="employee-info">
                        <img [src]="employee.avatar || getDefaultAvatar(employee)" [alt]="employee.firstName" class="avatar" />
                        <button type="button" class="employee-name-link" (click)="viewEmployee(employee)">
                          {{ employee.firstName }} {{ employee.lastName }}
                        </button>
                      </div>
                    </td>
                    <td>{{ employee.email }}</td>
                    <td>{{ employee.phone || '-' }}</td>
                    <td>{{ employee.designation }}</td>
                    <td>
                      <span class="dept-badge">{{ employee.department }}</span>
                    </td>
                    <td>
                      <span class="type-badge">{{ getEmploymentTypeLabel(employee.employmentType) }}</span>
                    </td>
                    <td>
                      <span class="location-badge">{{ getWorkLocationLabel(employee.workLocation) }}</span>
                    </td>
                    <td>
                      <span class="salary">₹{{ employee.salary | number }}</span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="'status-' + employee.employmentStatus">
                        {{ getStatusLabel(employee.employmentStatus) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-secondary" (click)="viewEmployee(employee)">View</button>
                      @if (isAdmin()) {
                        <button class="btn btn-sm btn-primary" (click)="editEmployee(employee)">Edit</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button 
              class="btn btn-sm btn-secondary" 
              (click)="previousPage()" 
              [disabled]="currentPage() === 1"
            >
              ← Previous
            </button>
            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>
            <button 
              class="btn btn-sm btn-secondary" 
              (click)="nextPage()" 
              [disabled]="currentPage() === totalPages()"
            >
              Next →
            </button>
          </div>
        } @else if (!isLoading()) {
          <p class="text-center text-muted">No employees found matching your criteria</p>
        }
      </app-card>
    </div>
  `,
  styles: [`
    .employees-container {
      padding: 0;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 6px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .hidden-file-input {
      display: none;
    }

    .upload-btn {
      padding: 10px 18px;
      border-radius: 6px;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.2);
      font-weight: 700;
    }

    .upload-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    }

    /* Filters */
    .filters-card {
      margin-bottom: 20px;
    }

    .preview-card {
      margin-bottom: 20px;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .preview-header h2 {
      margin: 0;
      font-size: 22px;
      color: #1e293b;
    }

    .preview-subtitle {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .preview-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .save-btn {
      box-shadow: 0 10px 24px rgba(30, 64, 175, 0.12);
    }

    .preview-table {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      animation: floatIn 0.45s ease;
    }

    .preview-table table {
      min-width: 900px;
    }

    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: floatIn 0.45s ease;
    }

    .search-box {
      position: relative;
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 10px 40px 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .export-btn {
      background: linear-gradient(135deg, #e0f2fe, #dbeafe);
      color: #1d4ed8;
      border: 1px solid rgba(59, 130, 246, 0.18);
      font-weight: 700;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
    }

    .export-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #1e3a8a;
    }

    .employees-table {
      width: 100%;
      height: calc(100vh - 400px);
      overflow-y: auto;
      overflow-x: auto;
      display: block;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      animation: floatIn 0.55s ease;
    }

    table {
      border-collapse: collapse;
      min-width: 1800px;
      width: 100%;
      background: white;
      table-layout: fixed;
      border: none;
    }

    /* Column Width Control */
    th:nth-child(1), td:nth-child(1) { width: 120px; } /* Employee ID */
    th:nth-child(2), td:nth-child(2) { width: 220px; } /* Name */
    th:nth-child(3), td:nth-child(3) { width: 250px; } /* Email */
    th:nth-child(4), td:nth-child(4) { width: 140px; } /* Phone */
    th:nth-child(5), td:nth-child(5) { width: 180px; } /* Designation */
    th:nth-child(6), td:nth-child(6) { width: 140px; } /* Department */
    th:nth-child(7), td:nth-child(7) { width: 140px; } /* Employment Type */
    th:nth-child(8), td:nth-child(8) { width: 130px; } /* Work Location */
    th:nth-child(9), td:nth-child(9) { width: 120px; } /* Salary */
    th:nth-child(10), td:nth-child(10) { width: 120px; } /* Status */
    th:nth-child(11), td:nth-child(11) { width: 160px; } /* Actions */

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

    th.sortable {
      cursor: pointer;
      user-select: none;
    }

    th.sortable:hover {
      background-color: #f1f5f9;
    }

    tr:hover td {
      background-color: #f9fafb;
    }

    .employee-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 180px;
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

    .employee-id {
      font-family: monospace;
      font-weight: 600;
      color: #64748b;
      font-size: 12px;
    }

    .dept-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #f3e8ff;
      color: #7c3aed;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .location-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #fef3c7;
      color: #d97706;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.status-active {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.status-on_leave {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.status-resigned {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.status-probation {
      background: #dbeafe;
      color: #2563eb;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin-right: 6px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
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

    .page-info {
      font-size: 14px;
      color: #64748b;
    }

    .text-center {
      text-align: center;
      padding: 40px;
    }

    .text-muted {
      color: #64748b;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
      }

      .upload-btn,
      .add-btn {
        width: 100%;
        justify-content: center;
      }
      
      .filter-controls {
        flex-direction: column;
        width: 100%;
      }

      .preview-header,
      .preview-actions {
        width: 100%;
      }

      .preview-actions .btn {
        flex: 1;
      }

      .filter-select {
        width: 100%;
      }

      th, td {
        padding: 10px 8px;
        font-size: 12px;
      }

      .employee-name {
        font-size: 13px;
      }

      .avatar {
        width: 32px;
        height: 32px;
      }

      .btn {
        padding: 4px 8px;
        font-size: 11px;
      }

      /* Hide less important columns on mobile */
      th:nth-child(4), td:nth-child(4),  /* Phone */
      th:nth-child(7), td:nth-child(7),  /* Employment Type */
      th:nth-child(8), td:nth-child(8),  /* Work Location */
      th:nth-child(9), td:nth-child(9) { /* Salary */
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  employees = this.employeeService.employees;
  isLoading = this.employeeService.isLoading;
  employeeCount = this.employeeService.employeeCount;

  // Check if current user is admin
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  isExporting = signal(false);
  isUploadingPreview = signal(false);
  isSavingImport = signal(false);
  previewData = signal<EmployeeImportPreview[]>([]);

  // Search and filter state
  searchQuery = signal('');
  filterDepartment = signal('');
  filterStatus = signal('');
  filterEmploymentType = signal('');

  // Sorting state
  sortField = signal<string>('firstName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Pagination state
  currentPage = signal(1);
  pageSize = 10;

  // Filtered and sorted employees
  filteredEmployees = computed(() => {
    let result = this.employees();

    // Apply search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(emp =>
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(query))
      );
    }

    // Apply department filter
    if (this.filterDepartment()) {
      result = result.filter(emp => emp.department === this.filterDepartment());
    }

    // Apply status filter
    if (this.filterStatus()) {
      result = result.filter(emp => emp.employmentStatus === this.filterStatus());
    }

    // Apply employment type filter
    if (this.filterEmploymentType()) {
      result = result.filter(emp => emp.employmentType === this.filterEmploymentType());
    }

    // Apply sorting
    const field = this.sortField();
    const order = this.sortOrder();
    result = [...result].sort((a: any, b: any) => {
      const aVal = a[field];
      const bVal = b[field];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  filteredEmployeeCount = computed(() => this.filteredEmployees().length);

  // Paginated employees
  paginatedEmployees = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEmployees().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredEmployees().length / this.pageSize));

  ngOnInit(): void {
    this.employeeService.getEmployees({ pageSize: 100, pageNumber: 1 });
  }

  onSearchChange(): void {
    this.currentPage.set(1); // Reset to first page on search
  }

  applyFilters(): void {
    this.currentPage.set(1); // Reset to first page on filter change
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      // Toggle sort order
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return '';
    return this.sortOrder() === 'asc' ? '↑' : '↓';
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  exportEmployees(): void {
    const employees = this.filteredEmployees();
    if (employees.length === 0) {
      alert('No employee data available to export.');
      return;
    }

    this.isExporting.set(true);

    try {
      const rows = employees.map((employee) => ({
        'Employee ID': employee.employeeId || employee.id,
        Name: `${employee.firstName} ${employee.lastName}`.trim(),
        Email: employee.email || '-',
        Phone: employee.phone || '-',
        Designation: employee.designation || '-',
        Department:
          typeof employee.department === 'string'
            ? employee.department
            : employee.department?.name || '-',
        'Employment Type': this.getEmploymentTypeLabel(employee.employmentType),
        'Work Location': this.getWorkLocationLabel(employee.workLocation),
        Salary: employee.salary ?? '-',
        Status: this.getStatusLabel(employee.employmentStatus),
        'Date Of Joining': employee.dateOfJoining
          ? new Date(employee.dateOfJoining).toLocaleDateString()
          : '-',
      }));

      const headers = Object.keys(rows[0]);
      const tableHead = headers.map((header) => `<th>${this.escapeHtml(header)}</th>`).join('');
      const tableRows = rows
        .map((row) => {
          const cells = headers
            .map((header) => `<td>${this.escapeHtml(String((row as Record<string, string | number>)[header] ?? ''))}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');

      const workbook = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="UTF-8" />
            <style>
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
              th { background: #1d4ed8; color: #ffffff; font-weight: 700; }
              tr:nth-child(even) td { background: #eff6ff; }
              caption { text-align: left; font-size: 20px; font-weight: 700; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <table>
              <caption>Employee Directory Export</caption>
              <thead><tr>${tableHead}</tr></thead>
              <tbody>${tableRows}</tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', workbook], {
        type: 'application/vnd.ms-excel;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `employees-${today}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      this.isExporting.set(false);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  getDefaultAvatar(employee: any): string {
    return `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=1e40af&color=fff`;
  }

  getEmploymentTypeLabel(type: any): string {
    const labels: Record<string, string> = {
      'permanent': 'Permanent',
      'contract': 'Contract',
      'part_time': 'Part Time',
      'temporary': 'Temporary',
      'intern': 'Intern'
    };
    return labels[type] || type || 'Permanent';
  }

  getWorkLocationLabel(location: any): string {
    const labels: Record<string, string> = {
      'office': 'Office',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return labels[location] || location || 'Office';
  }

  getStatusLabel(status: any): string {
    const labels: Record<string, string> = {
      'active': 'Active',
      'on_leave': 'On Leave',
      'resigned': 'Resigned',
      'terminated': 'Terminated',
      'probation': 'Probation'
    };
    return labels[status] || status || 'Active';
  }

  viewEmployee(employee: any): void {
    this.router.navigate(['/employees', employee.id]);
  }

  editEmployee(employee: any): void {
    this.router.navigate(['/employees', employee.id, 'edit']);
  }

  addEmployee(): void {
    this.router.navigate(['/employees/new']);
  }

  async onExcelFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isUploadingPreview.set(true);

    try {
      const preview = await this.employeeService.uploadEmployeesPreview(file);
      this.previewData.set(preview);

      if (preview.length === 0) {
        alert('No valid employee rows were found in the uploaded file.');
      }
    } catch (error) {
      console.error('Error generating employee preview:', error);
      alert('Failed to generate employee preview.');
    } finally {
      this.isUploadingPreview.set(false);
      input.value = '';
    }
  }

  clearPreview(): void {
    this.previewData.set([]);
  }

  async saveImportedEmployees(): Promise<void> {
    if (this.previewData().length === 0) {
      return;
    }

    this.isSavingImport.set(true);

    try {
      const response = await this.employeeService.saveImportedEmployees(this.previewData());
      await this.employeeService.getEmployees({ pageSize: 100, pageNumber: 1 });
      this.previewData.set([]);
      alert(`${response.message} Saved: ${response.saved}, Skipped: ${response.skipped}.`);
    } catch (error) {
      console.error('Error saving imported employees:', error);
      alert('Failed to save imported employees.');
    } finally {
      this.isSavingImport.set(false);
    }
  }
}
