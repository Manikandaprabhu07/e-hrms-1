import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent, CardComponent } from '../../shared/components';
import { PayrollService, AuthService, EmployeeService } from '../../core/services';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
}

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CardComponent],
  template: `
    <div class="payroll-container">
      <div class="page-header">
        <h1>Payroll Management</h1>
        <p class="subtitle">Manage employee salaries and payslips</p>
      </div>

      <app-card [elevated]="true">
        @if (isAdmin()) {
          <div class="toolbar">
            <button class="btn btn-primary" (click)="toggleForm()">
              {{ showForm() ? 'Close' : '+ Add Payroll' }}
            </button>
          </div>

          @if (showForm()) {
            <div class="form-grid">
              <div class="form-group">
                <label>Employee</label>
                <select [(ngModel)]="form.employeeId">
                  <option value="">Select employee</option>
                  @for (emp of employees(); track emp.id) {
                    <option [value]="emp.id">{{ emp.employeeId }} - {{ emp.firstName }} {{ emp.lastName }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Month</label>
                <input [(ngModel)]="form.month" placeholder="March" />
              </div>
              <div class="form-group">
                <label>Year</label>
                <input type="number" [(ngModel)]="form.year" />
              </div>
              <div class="form-group">
                <label>Basic Salary</label>
                <input type="number" [(ngModel)]="form.basicSalary" />
              </div>
              <div class="form-group">
                <label>Allowances</label>
                <input type="number" [(ngModel)]="form.allowances" />
              </div>
              <div class="form-group">
                <label>Deductions</label>
                <input type="number" [(ngModel)]="form.deductions" />
              </div>
              <div class="form-group">
                <label>Payment Status</label>
                <select [(ngModel)]="form.paymentStatus">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="form-group">
                <label>Payment Date</label>
                <input type="date" [(ngModel)]="form.paymentDate" />
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" (click)="savePayroll()">{{ editingId() ? 'Update' : 'Save' }}</button>
                <button class="btn btn-secondary" (click)="resetForm()">Reset</button>
              </div>
            </div>
          }
        }
        <app-loading-spinner [isLoading]="isLoading()" message="Loading payroll data..." />
        
        @if (!isLoading() && payrollRecords().length > 0) {
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (record of payrollRecords(); track record.id) {
                  <tr>
                    <td>
                      <div class="employee-info">
                        <span class="employee-name">{{ record.employeeName }}</span>
                        <span class="employee-id">{{ record.employeeId }}</span>
                      </div>
                    </td>
                    <td>{{ record.month }}</td>
                    <td>₹{{ record.basicSalary | number }}</td>
                    <td><span class="text-success">+₹{{ record.allowances | number }}</span></td>
                    <td><span class="text-danger">-₹{{ record.deductions | number }}</span></td>
                    <td>
                      <span class="net-salary">₹{{ record.netSalary | number }}</span>
                    </td>
                    <td>
                      <span class="status-badge" [ngClass]="getStatusClass(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                    <td>{{ record.paymentDate || '-' }}</td>
                    <td>
                      <div class="row-actions">
                        <button class="btn btn-sm btn-primary" (click)="viewSlip(record)">View Slip</button>
                        @if (isAdmin()) {
                          <button class="btn btn-sm btn-secondary btn-edit" (click)="edit(record)">Edit</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!isLoading()) {
          <p class="text-center text-muted">No payroll records found</p>
        }
      </app-card>
    </div>

    @if (selectedSlip(); as slip) {
      <div class="slip-backdrop" (click)="closeSlip()"></div>
      <div class="slip-modal">
        <div class="slip-header">
          <div>
            <div class="slip-title">Payslip</div>
            <div class="slip-subtitle">{{ slip.employeeName }} · {{ slip.employeeId }}</div>
          </div>
          <button class="icon-btn" (click)="closeSlip()">×</button>
        </div>

        <div class="slip-body">
          <div class="slip-row">
            <div class="label">Period</div>
            <div class="value">{{ slip.month }}</div>
          </div>
          <div class="slip-row">
            <div class="label">Basic Salary</div>
            <div class="value">₹{{ slip.basicSalary | number }}</div>
          </div>
          <div class="slip-row">
            <div class="label">Allowances</div>
            <div class="value">₹{{ slip.allowances | number }}</div>
          </div>
          <div class="slip-row">
            <div class="label">Deductions</div>
            <div class="value">₹{{ slip.deductions | number }}</div>
          </div>
          <div class="slip-row total">
            <div class="label">Net Salary</div>
            <div class="value">₹{{ slip.netSalary | number }}</div>
          </div>
          <div class="slip-row">
            <div class="label">Status</div>
            <div class="value">{{ slip.status }}</div>
          </div>
          <div class="slip-row">
            <div class="label">Payment Date</div>
            <div class="value">{{ slip.paymentDate || '-' }}</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .payroll-container {
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

    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      padding: 12px 0 18px 0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 12px;
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
      background: rgba(255, 255, 255, 0.9);
      outline: none;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      flex-wrap: nowrap;
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

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Column Widths */
    th:nth-child(1), td:nth-child(1) { width: 250px; } /* Employee */
    th:nth-child(2), td:nth-child(2) { width: 150px; } /* Month */
    th:nth-child(3), td:nth-child(3) { width: 140px; } /* Basic */
    th:nth-child(4), td:nth-child(4) { width: 130px; } /* Allowances */
    th:nth-child(5), td:nth-child(5) { width: 130px; } /* Deductions */
    th:nth-child(6), td:nth-child(6) { width: 140px; } /* Net */
    th:nth-child(7), td:nth-child(7) { width: 120px; } /* Status */
    th:nth-child(8), td:nth-child(8) { width: 140px; } /* date */
    th:nth-child(9), td:nth-child(9) { width: 160px; } /* Actions */

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

    .employee-info {
      display: flex;
      flex-direction: column;
    }

    .employee-name {
      font-weight: 600;
      color: #1e293b;
    }

    .employee-id {
      font-size: 12px;
      color: #64748b;
    }

    .net-salary {
      font-weight: 700;
      color: #0f172a;
    }

    .text-success { color: #16a34a; }
    .text-danger { color: #dc2626; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.paid {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-badge.pending {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.processing {
      background: #fff7ed;
      color: #ea580c;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-primary {
      background: #1e40af;
      color: white;
    }

    .btn-primary:hover {
      background: #1e3a8a;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #0f172a;
      border: 1px solid rgba(148, 163, 184, 0.28);
    }

    .btn-secondary:hover {
      background: #cbd5e1;
    }

    .btn-edit {
      min-width: 72px;
      font-weight: 700;
    }

    .text-center {
      text-align: center;
      padding: 40px;
    }

    .text-muted {
      color: #64748b;
    }

    .slip-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.25);
      z-index: 350;
    }

    .slip-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(540px, calc(100vw - 32px));
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(226,232,240,0.9);
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      z-index: 400;
      overflow: hidden;
    }

    .slip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 14px;
      border-bottom: 1px solid rgba(226,232,240,0.9);
    }
    .slip-title { font-weight: 900; font-size: 16px; color: #0f172a; }
    .slip-subtitle { margin-top: 4px; font-size: 12px; color: #64748b; font-weight: 700; }
    .icon-btn { border: none; background: transparent; font-size: 22px; cursor: pointer; color: #334155; }

    .slip-body { padding: 14px 14px; display: flex; flex-direction: column; gap: 10px; }
    .slip-row { display: flex; justify-content: space-between; gap: 12px; }
    .slip-row .label { font-size: 12px; color: #64748b; font-weight: 800; }
    .slip-row .value { font-size: 13px; color: #0f172a; font-weight: 900; text-align: right; }
    .slip-row.total .value { font-size: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollListComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  isLoading = signal<boolean>(true);
  payrollRecords = signal<PayrollRecord[]>([]);
  employees = signal<any[]>([]);
  selectedSlip = signal<PayrollRecord | null>(null);

  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  showForm = signal(false);
  editingId = signal<string | null>(null);
  form = {
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    paymentStatus: 'Pending',
    paymentDate: '',
  };

  async ngOnInit(): Promise<void> {
    await this.loadPayroll();

    if (this.isAdmin()) {
      void this.loadEmployees();
    } else {
      const openLatest = this.route.snapshot.queryParamMap.get('openLatest');
      if (openLatest && (this.payrollRecords() || []).length) {
        this.viewSlip(this.payrollRecords()[0]);
      }
    }
  }

  private async loadPayroll(): Promise<void> {
    try {
      this.isLoading.set(true);
      const records = this.isAdmin()
        ? await this.payrollService.getAll()
        : await this.payrollService.getMine();
      const mapped = (records || []).map((record: any) => {
        const employee = record.employee || {};
        const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
        const paymentStatus = (record.paymentStatus || record.status || 'Pending') as string;
        const status = paymentStatus === 'Paid'
          ? 'Paid'
          : paymentStatus === 'Pending'
            ? 'Pending'
            : 'Processing';

        return {
          id: record.id,
          employeeName,
          employeeId: employee.employeeId || employee.id || '-',
          month: `${record.month || ''} ${record.year || ''}`.trim(),
          basicSalary: Number(record.basicSalary || 0),
          allowances: Number(record.allowances || 0),
          deductions: Number(record.deductions || 0),
          netSalary: Number(record.netSalary || 0),
          status,
          paymentDate: record.paymentDate ? new Date(record.paymentDate).toISOString().split('T')[0] : undefined
        } as PayrollRecord;
      });
      this.payrollRecords.set(mapped);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadEmployees(): Promise<void> {
    await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 });
    this.employees.set(this.employeeService.employees() || []);
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  edit(record: PayrollRecord): void {
    this.showForm.set(true);
    this.editingId.set(record.id);
    const emp = (this.employees() || []).find((e: any) => e.employeeId === record.employeeId) || null;
    this.form.employeeId = emp?.id || '';
    const parts = String(record.month || '').split(' ');
    this.form.month = parts[0] || '';
    this.form.year = Number(parts[1] || new Date().getFullYear());
    this.form.basicSalary = record.basicSalary;
    this.form.allowances = record.allowances;
    this.form.deductions = record.deductions;
    this.form.paymentStatus = record.status === 'Paid' ? 'Paid' : 'Pending';
    this.form.paymentDate = record.paymentDate || '';
  }

  async savePayroll(): Promise<void> {
    if (!this.form.month || !this.form.year) {
      alert('Month and year are required.');
      return;
    }
    if (!this.editingId() && !this.form.employeeId) {
      alert('Employee is required.');
      return;
    }

    const payload: any = {
      employeeId: this.form.employeeId,
      month: this.form.month,
      year: this.form.year,
      basicSalary: Number(this.form.basicSalary || 0),
      allowances: Number(this.form.allowances || 0),
      deductions: Number(this.form.deductions || 0),
      paymentStatus: this.form.paymentStatus,
      paymentDate: this.form.paymentDate || null,
    };

    if (this.editingId()) {
      delete payload.employeeId;
      await this.payrollService.update(this.editingId()!, payload);
    } else {
      await this.payrollService.create(payload);
    }

    this.resetForm();
    await this.loadPayroll();
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form = {
      employeeId: '',
      month: '',
      year: new Date().getFullYear(),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      paymentStatus: 'Pending',
      paymentDate: '',
    };
  }

  viewSlip(record: PayrollRecord): void {
    this.selectedSlip.set(record);
  }

  closeSlip(): void {
    this.selectedSlip.set(null);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
