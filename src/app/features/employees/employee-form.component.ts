import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../shared/components';
import { EmploymentType, EmployeeStatus, WorkLocationType, ShiftType, Employee } from '../../core/models';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent],
  template: `
    <div class="employee-form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? 'Edit Employee' : 'Add New Employee' }}</h1>
        <button class="btn btn-secondary" (click)="onCancel()">✕ Cancel</button>
      </div>

      <!-- Step Progress Indicator -->
      <div class="steps-indicator">
        @for (step of steps; track step.id; let i = $index) {
          <button
            type="button"
            class="step"
            [class.active]="currentStep() === i"
            [class.completed]="i < currentStep()"
            (click)="goToStep(i)"
          >
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </button>
        }
      </div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        
        <!-- Step 1: Basic / Personal Details -->
        @if (currentStep() === 0) {
          <app-card [title]="'Basic / Personal Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group">
                <label>Employee ID</label>
                <input type="text" formControlName="employeeId" placeholder="Auto-generated" readonly />
              </div>

              <div class="form-group required">
                <label>First Name *</label>
                <input type="text" formControlName="firstName" placeholder="Enter first name" />
                @if (isFieldInvalid('firstName')) {
                  <span class="error">First name is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Last Name *</label>
                <input type="text" formControlName="lastName" placeholder="Enter last name" />
                @if (isFieldInvalid('lastName')) {
                  <span class="error">Last name is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Gender *</label>
                <select formControlName="gender">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                @if (isFieldInvalid('gender')) {
                  <span class="error">Gender is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Date of Birth *</label>
                <input type="date" formControlName="dateOfBirth" />
                @if (isFieldInvalid('dateOfBirth')) {
                  <span class="error">Date of birth is required</span>
                }
              </div>

              <div class="form-group">
                <label>Age</label>
                <input type="text" [value]="calculatedAge()" readonly />
              </div>

              <div class="form-group">
                <label>Marital Status</label>
                <select formControlName="maritalStatus">
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div class="form-group">
                <label>Blood Group</label>
                <select formControlName="bloodGroup">
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div class="form-group">
                <label>Nationality</label>
                <input type="text" formControlName="nationality" placeholder="e.g., Indian" />
              </div>

              <div class="form-group full-width">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" (change)="onFileSelect($event, 'profilePhoto')" />
                <small>Upload a professional photo (JPG, PNG - Max 2MB)</small>
                @if (profilePhotoPreview()) {
                  <div class="upload-preview">
                    <img [src]="profilePhotoPreview()" alt="Profile preview" class="profile-preview" />
                    <span>{{ uploadedDocumentCount() }} document(s) ready</span>
                  </div>
                }
              </div>
            </div>
          </app-card>
        }

        <!-- Step 2: Contact Details -->
        @if (currentStep() === 1) {
          <app-card [title]="'Contact Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group">
                <label>Personal Email</label>
                <input type="email" formControlName="personalEmail" placeholder="personal@example.com" />
              </div>

              <div class="form-group required">
                <label>Official Email *</label>
                <input type="email" formControlName="officialEmail" placeholder="employee@company.com" />
                @if (isFieldInvalid('officialEmail')) {
                  <span class="error">Valid official email is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Mobile Number *</label>
                <input type="tel" formControlName="mobileNumber" placeholder="+91 98765 43210" />
                @if (isFieldInvalid('mobileNumber')) {
                  <span class="error">Mobile number is required</span>
                }
              </div>

              <div class="form-group">
                <label>Emergency Contact Name</label>
                <input type="text" formControlName="emergencyContactName" placeholder="Contact person name" />
              </div>

              <div class="form-group">
                <label>Emergency Contact Number</label>
                <input type="tel" formControlName="emergencyContactNumber" placeholder="+91 98765 43210" />
              </div>

              <div class="form-group full-width">
                <label>Current Address</label>
                <textarea formControlName="currentAddress" rows="3" placeholder="Street, City, State, PIN"></textarea>
              </div>

              <div class="form-group full-width">
                <label>Permanent Address</label>
                <textarea formControlName="permanentAddress" rows="3" placeholder="Street, City, State, PIN"></textarea>
                <label class="checkbox-label">
                  <input type="checkbox" (change)="copyCurrentToPermanent($event)" />
                  Same as current address
                </label>
              </div>
            </div>
          </app-card>
        }

        <!-- Step 3: Employment / Job Details -->
        @if (currentStep() === 2) {
          <app-card [title]="'Employment / Job Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group required">
                <label>Department *</label>
                <select formControlName="department">
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR & Admin">HR & Admin</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
                @if (isFieldInvalid('department')) {
                  <span class="error">Department is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Designation / Role *</label>
                <input type="text" formControlName="designation" placeholder="e.g., Senior Developer" />
                @if (isFieldInvalid('designation')) {
                  <span class="error">Designation is required</span>
                }
              </div>

              <div class="form-group">
                <label>Job Title</label>
                <input type="text" formControlName="jobTitle" placeholder="Official job title" />
              </div>

              <div class="form-group required">
                <label>Employee Type *</label>
                <select formControlName="employmentType">
                  <option value="">Select type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="part_time">Part Time</option>
                  <option value="intern">Intern</option>
                </select>
                @if (isFieldInvalid('employmentType')) {
                  <span class="error">Employment type is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Date of Joining *</label>
                <input type="date" formControlName="dateOfJoining" />
                @if (isFieldInvalid('dateOfJoining')) {
                  <span class="error">Joining date is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Work Location *</label>
                <select formControlName="workLocation">
                  <option value="">Select location</option>
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                @if (isFieldInvalid('workLocation')) {
                  <span class="error">Work location is required</span>
                }
              </div>

              <div class="form-group">
                <label>Shift / Work Schedule</label>
                <select formControlName="shift">
                  <option value="">Select shift</option>
                  <option value="morning">Morning (9 AM - 6 PM)</option>
                  <option value="evening">Evening (2 PM - 11 PM)</option>
                  <option value="night">Night (10 PM - 7 AM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div class="form-group">
                <label>Reporting Manager</label>
                <input type="text" formControlName="reportingManager" placeholder="Manager name" />
              </div>

              <div class="form-group">
                <label>Employment Status</label>
                <select formControlName="employmentStatus">
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </app-card>
        }

        <!-- Step 4: Salary & Payroll Details -->
        @if (currentStep() === 3) {
          <app-card [title]="'Salary & Payroll Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group required">
                <label>Basic Salary *</label>
                <input type="number" formControlName="basicSalary" placeholder="50000" />
                @if (isFieldInvalid('basicSalary')) {
                  <span class="error">Basic salary is required</span>
                }
              </div>

              <div class="form-group">
                <label>HRA (House Rent Allowance)</label>
                <input type="number" formControlName="hra" placeholder="20000" />
              </div>

              <div class="form-group">
                <label>DA (Dearness Allowance)</label>
                <input type="number" formControlName="da" placeholder="5000" />
              </div>

              <div class="form-group">
                <label>Other Allowances</label>
                <input type="number" formControlName="otherAllowances" placeholder="10000" />
              </div>

              <div class="form-group">
                <label>Total CTC (Calculated)</label>
                <input type="text" [value]="calculatedCTC()" readonly class="calculated-field" />
              </div>

              <div class="form-group">
                <label>Pay Frequency</label>
                <select formControlName="payFrequency">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
              </div>

              <div class="form-group">
                <label>Bank Name</label>
                <input type="text" formControlName="bankName" placeholder="e.g., HDFC Bank" />
              </div>

              <div class="form-group">
                <label>Account Number</label>
                <input type="text" formControlName="accountNumber" placeholder="1234567890" />
              </div>

              <div class="form-group">
                <label>IFSC Code</label>
                <input type="text" formControlName="ifscCode" placeholder="HDFC0001234" />
              </div>

              <div class="form-group">
                <label>PAN Number</label>
                <input type="text" formControlName="panNumber" placeholder="ABCDE1234F" />
              </div>

              <div class="form-group">
                <label>PF Number / UAN</label>
                <input type="text" formControlName="pfNumber" placeholder="PF/UAN Number" />
              </div>

              <div class="form-group">
                <label>ESI Number</label>
                <input type="text" formControlName="esiNumber" placeholder="ESI Number (if applicable)" />
              </div>
            </div>
          </app-card>
        }

        <!-- Step 5: Identity & Documents -->
        @if (currentStep() === 4) {
          <app-card [title]="'Identity & Documents'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group">
                <label>Aadhaar Number</label>
                <input type="text" formControlName="aadhaarNumber" placeholder="1234 5678 9012" />
              </div>

              <div class="form-group">
                <label>PAN Card</label>
                <input type="text" formControlName="panCard" placeholder="ABCDE1234F" />
              </div>

              <div class="form-group">
                <label>Passport Number</label>
                <input type="text" formControlName="passportNumber" placeholder="A1234567" />
              </div>

              <div class="form-group full-width">
                <label>Resume (PDF)</label>
                <input type="file" accept=".pdf" (change)="onFileSelect($event, 'resume')" />
                <small>Upload resume in PDF format (Max 5MB)</small>
                @if (selectedFileNames()['resume']) {
                  <span class="file-pill">{{ selectedFileNames()['resume'] }}</span>
                }
              </div>

              <div class="form-group full-width">
                <label>Offer Letter</label>
                <input type="file" accept=".pdf" (change)="onFileSelect($event, 'offerLetter')" />
                <small>Upload offer letter (PDF - Max 5MB)</small>
                @if (selectedFileNames()['offerLetter']) {
                  <span class="file-pill">{{ selectedFileNames()['offerLetter'] }}</span>
                }
              </div>

              <div class="form-group full-width">
                <label>Experience Certificates</label>
                <input type="file" accept=".pdf" multiple (change)="onFileSelect($event, 'experienceCerts')" />
                <small>Upload experience certificates (PDF - Max 5MB each)</small>
                @if (selectedFileNames()['experienceCerts']) {
                  <span class="file-pill">{{ selectedFileNames()['experienceCerts'] }}</span>
                }
              </div>

              <div class="form-group full-width">
                <label>Educational Certificates</label>
                <input type="file" accept=".pdf,.jpg,.png" multiple (change)="onFileSelect($event, 'educationCerts')" />
                <small>Upload educational certificates (PDF/Image - Max 5MB each)</small>
                @if (selectedFileNames()['educationCerts']) {
                  <span class="file-pill">{{ selectedFileNames()['educationCerts'] }}</span>
                }
              </div>

              <div class="form-group full-width">
                <label>ID Proof Upload</label>
                <input type="file" accept=".pdf,.jpg,.png" (change)="onFileSelect($event, 'idProof')" />
                <small>Upload Aadhaar/PAN/Passport (PDF/Image - Max 5MB)</small>
                @if (selectedFileNames()['idProof']) {
                  <span class="file-pill">{{ selectedFileNames()['idProof'] }}</span>
                }
              </div>
            </div>
          </app-card>
        }

        <!-- Step 6: Education & Experience -->
        @if (currentStep() === 5) {
          <app-card [title]="'Education & Experience'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group">
                <label>Highest Qualification</label>
                <select formControlName="highestQualification">
                  <option value="">Select qualification</option>
                  <option value="high_school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div class="form-group">
                <label>University / College</label>
                <input type="text" formControlName="university" placeholder="University name" />
              </div>

              <div class="form-group">
                <label>Year of Passing</label>
                <input type="number" formControlName="yearOfPassing" placeholder="2020" min="1950" max="2030" />
              </div>

              <div class="form-group full-width">
                <label>Skills</label>
                <textarea formControlName="skills" rows="3" placeholder="e.g., JavaScript, React, Node.js, Python"></textarea>
                <small>Comma-separated list of skills</small>
              </div>

              <div class="form-group">
                <label>Total Experience (Years)</label>
                <input type="number" formControlName="totalExperience" placeholder="5" step="0.5" />
              </div>

              <div class="form-group">
                <label>Previous Company Name</label>
                <input type="text" formControlName="previousCompany" placeholder="Company name" />
              </div>

              <div class="form-group">
                <label>Previous Designation</label>
                <input type="text" formControlName="previousDesignation" placeholder="Previous role" />
              </div>
            </div>
          </app-card>
        }

        <!-- Step 7: System / Login Details -->
        @if (currentStep() === 6) {
          <app-card [title]="'System / Login Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group required">
                <label>Username *</label>
                <input type="text" formControlName="username" placeholder="employee.username" />
                @if (isFieldInvalid('username')) {
                  <span class="error">Username is required</span>
                }
              </div>

              <div class="form-group" [class.required]="!isEditMode()">
                <label>Password {{ isEditMode() ? '' : '*' }}</label>
                <input type="password" formControlName="password" placeholder="Set initial password" />
                @if (!isEditMode() && isFieldInvalid('password')) {
                  <span class="error">Password is required</span>
                }
                @if (isEditMode()) {
                  <small>Leave blank to keep password unchanged</small>
                }
              </div>

              <div class="form-group" [class.required]="!isEditMode()">
                <label>Confirm Password {{ isEditMode() ? '' : '*' }}</label>
                <input type="password" formControlName="confirmPassword" placeholder="Confirm password" />
                @if (!isEditMode() && isFieldInvalid('confirmPassword')) {
                  <span class="error">Confirm password is required</span>
                }
              </div>

              <div class="form-group required">
                <label>Role *</label>
                <select formControlName="role">
                  <option value="">Select role</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Admin</option>
                </select>
                @if (isFieldInvalid('role')) {
                  <span class="error">Role is required</span>
                }
              </div>

              <div class="form-group">
                <label>Access Permissions</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" value="READ" />
                    Read Access
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" value="WRITE" />
                    Write Access
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" value="DELETE" />
                    Delete Access
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>Login Status</label>
                <select formControlName="loginStatus">
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </app-card>
        }

        <!-- Step 8: Additional Details -->
        @if (currentStep() === 7) {
          <app-card [title]="'Additional Details'" [elevated]="true">
            <div class="form-grid">
              <div class="form-group">
                <label>Leave Policy</label>
                <select formControlName="leavePolicy">
                  <option value="">Select policy</option>
                  <option value="standard">Standard (12 CL, 12 SL)</option>
                  <option value="senior">Senior (18 CL, 12 SL)</option>
                  <option value="executive">Executive (24 CL, 12 SL)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Probation Period (Months)</label>
                <input type="number" formControlName="probationPeriod" placeholder="3" min="0" max="12" />
              </div>

              <div class="form-group">
                <label>Confirmation Date</label>
                <input type="date" formControlName="confirmationDate" />
              </div>

              <div class="form-group">
                <label>Employee Category</label>
                <select formControlName="employeeCategory">
                  <option value="">Select category</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Notes / Remarks</label>
                <textarea formControlName="notes" rows="4" placeholder="Any additional notes or remarks"></textarea>
              </div>

              <div class="form-group full-width">
                <label>Asset Allocation</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" value="laptop" />
                    Laptop
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" value="id_card" />
                    ID Card
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" value="access_card" />
                    Access Card
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" value="mobile" />
                    Mobile Phone
                  </label>
                </div>
              </div>
            </div>
          </app-card>
        }

        <!-- Navigation Buttons -->
        <div class="form-actions">
          @if (currentStep() > 0) {
            <button type="button" class="btn btn-secondary" (click)="previousStep()">
              ← Previous
            </button>
          }
          
          <div class="spacer"></div>

          @if (currentStep() < steps.length - 1) {
            <button type="button" class="btn btn-primary" (click)="nextStep()">
              Next →
            </button>
          } @else {
            <button type="submit" class="btn btn-success">
              💾 Save Employee
            </button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [`
    .employee-form-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .form-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
    }

    /* Steps Indicator */
    .steps-indicator {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      padding: 0 20px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    .step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e2e8f0;
      z-index: -1;
    }

    .step.completed:not(:last-child)::after {
      background: #3b82f6;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 8px;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: #3b82f6;
      color: white;
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      max-width: 100px;
    }

    .step.active .step-label {
      color: #1e293b;
      font-weight: 600;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      padding: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .upload-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(239, 246, 255, 0.9);
      border: 1px solid rgba(191, 219, 254, 0.9);
      font-size: 12px;
      font-weight: 700;
      color: #1d4ed8;
    }

    .profile-preview {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ffffff;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.14);
    }

    .file-pill {
      display: inline-flex;
      margin-top: 10px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(241, 245, 249, 0.95);
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      width: fit-content;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group.required label::after {
      content: ' *';
      color: #dc2626;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .form-group input:read-only,
    .form-group input.calculated-field {
      background: #f8fafc;
      color: #64748b;
    }

    .form-group small {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .error {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal !important;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
    }

    .spacer {
      flex: 1;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .steps-indicator {
        overflow-x: auto;
        padding: 0 10px;
      }

      .step-label {
        font-size: 10px;
        max-width: 60px;
      }

      .step-number {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  isEditMode = signal(false);
  currentStep = signal(0);
  profilePhotoPreview = signal<string>('');
  uploadedDocuments = signal<any[]>([]);
  selectedFileNames = signal<Record<string, string>>({});
  uploadedDocumentCount = computed(() => this.uploadedDocuments().length);

  steps = [
    { id: 1, label: 'Basic Details' },
    { id: 2, label: 'Contact' },
    { id: 3, label: 'Employment' },
    { id: 4, label: 'Salary' },
    { id: 5, label: 'Documents' },
    { id: 6, label: 'Education' },
    { id: 7, label: 'System Access' },
    { id: 8, label: 'Additional' }
  ];

  employeeForm: FormGroup = this.fb.group({
    // Basic Details
    employeeId: ['EMP' + Math.random().toString(36).substr(2, 6).toUpperCase()],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    maritalStatus: [''],
    bloodGroup: [''],
    nationality: [''],

    // Contact Details
    personalEmail: [''],
    officialEmail: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', Validators.required],
    emergencyContactName: [''],
    emergencyContactNumber: [''],
    currentAddress: [''],
    permanentAddress: [''],

    // Employment Details
    department: ['', Validators.required],
    designation: ['', Validators.required],
    jobTitle: [''],
    employmentType: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    workLocation: ['', Validators.required],
    shift: [''],
    reportingManager: [''],
    employmentStatus: ['active'],

    // Salary Details
    basicSalary: ['', Validators.required],
    hra: [0],
    da: [0],
    otherAllowances: [0],
    payFrequency: ['monthly'],
    bankName: [''],
    accountNumber: [''],
    ifscCode: [''],
    panNumber: [''],
    pfNumber: [''],
    esiNumber: [''],

    // Identity & Documents
    aadhaarNumber: [''],
    panCard: [''],
    passportNumber: [''],

    // Education & Experience
    highestQualification: [''],
    university: [''],
    yearOfPassing: [''],
    skills: [''],
    totalExperience: [0],
    previousCompany: [''],
    previousDesignation: [''],

    // System Access
    username: ['', Validators.required],
    role: ['', Validators.required],
    password: [''],
    confirmPassword: [''],
    loginStatus: ['enabled'],

    // Additional
    leavePolicy: [''],
    probationPeriod: [3],
    confirmationDate: [''],
    employeeCategory: [''],
    notes: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadEmployeeData(id);
    }
  }

  private async loadEmployeeData(id: string): Promise<void> {
    try {
      const employee = await this.employeeService.getEmployeeById(id);
      if (employee) {
        this.patchFormValues(employee);
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      alert('Failed to load employee data. Returning to list.');
      this.router.navigate(['/employees']);
    }
  }

  private patchFormValues(employee: Employee): void {
    // Map basic fields to their corresponding form control names
    this.employeeForm.patchValue({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      officialEmail: employee.email, // Map email to officialEmail
      mobileNumber: employee.phone, // Map phone to mobileNumber
      designation: employee.designation,
      department: employee.department,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      workLocation: employee.workLocation,
      basicSalary: employee.salary, // Map salary to basicSalary
      isActive: employee.isActive
    });

    // Handle nested or additional fields if they exist in the model
    if (employee.contact) {
      this.employeeForm.patchValue({
        personalEmail: employee.contact.personalEmail || '',
        officialEmail: employee.contact.companyEmail || employee.email,
        mobileNumber: employee.contact.primaryPhone || employee.phone,
        emergencyContactName: employee.contact.emergencyContact || '',
        emergencyContactNumber: employee.contact.emergencyPhone || ''
      });
    }

    if (employee.address) {
      if (typeof employee.address === 'string') {
        this.employeeForm.patchValue({ currentAddress: employee.address });
      } else {
        this.employeeForm.patchValue({
          currentAddress: `${employee.address.street}, ${employee.address.city}, ${employee.address.state}`,
          permanentAddress: employee.address.addressType === 'permanent' ?
            `${employee.address.street}, ${employee.address.city}, ${employee.address.state}` : ''
        });
      }
    }

    // Map other fields as needed based on the model provided in employee.model.ts
    this.employeeForm.patchValue({
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
      gender: employee.gender,
      nationality: employee.nationality,
      passportNumber: employee.passportNumber
    });

    this.profilePhotoPreview.set((employee as any).profilePhoto || (employee as any).avatar || '');
    const existingDocuments = Array.isArray((employee as any).documents) ? ((employee as any).documents as any[]) : [];
    this.uploadedDocuments.set(existingDocuments);
    this.selectedFileNames.set(
      existingDocuments.reduce((acc: Record<string, string>, doc: any) => {
        acc[doc.category] = acc[doc.category] ? `${acc[doc.category]}, ${doc.name}` : doc.name;
        return acc;
      }, {}),
    );
  }

  calculatedAge(): string {
    const dob = this.employeeForm.get('dateOfBirth')?.value;
    if (!dob) return '';

    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? String(age) : '';
  }

  calculatedCTC = computed(() => {
    const basic = Number(this.employeeForm.get('basicSalary')?.value) || 0;
    const hra = Number(this.employeeForm.get('hra')?.value) || 0;
    const da = Number(this.employeeForm.get('da')?.value) || 0;
    const other = Number(this.employeeForm.get('otherAllowances')?.value) || 0;

    const monthly = basic + hra + da + other;
    const annual = monthly * 12;

    return '₹' + annual.toLocaleString('en-IN') + ' / year';
  });

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(step => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(step => step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(stepIndex: number): void {
    this.currentStep.set(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  copyCurrentToPermanent(event: any): void {
    if (event.target.checked) {
      const currentAddress = this.employeeForm.get('currentAddress')?.value;
      this.employeeForm.patchValue({ permanentAddress: currentAddress });
    }
  }

  async onFileSelect(event: any, fieldName: string): Promise<void> {
    const files = Array.from(event.target.files || []) as File[];
    if (files.length === 0) {
      return;
    }

    const maxDocumentBytes = 4 * 1024 * 1024;
    if (fieldName !== 'profilePhoto' && files.some((file) => file.size > maxDocumentBytes)) {
      alert('Please upload document files smaller than 4 MB each.');
      event.target.value = '';
      return;
    }

    this.selectedFileNames.update((current) => ({
      ...current,
      [fieldName]: files.map((file) => file.name).join(', '),
    }));

    if (fieldName === 'profilePhoto') {
      const imageFile = files[0];
      const dataUrl = await this.readImageAsCompressedDataUrl(imageFile);
      this.profilePhotoPreview.set(dataUrl);
      return;
    }

    const mappedDocuments = await Promise.all(
      files.map(async (file, index) => {
        const dataUrl = await this.readFileAsDataUrl(file);
        return {
          id: `${fieldName}-${Date.now()}-${index}`,
          name: file.name,
          category: fieldName,
          contentType: file.type || 'application/octet-stream',
          dataUrl,
        };
      }),
    );

    this.uploadedDocuments.update((current) => {
      const withoutCurrentCategory = current.filter((doc) => doc.category !== fieldName);
      return [...withoutCurrentCategory, ...mappedDocuments];
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.isEditMode()) {
      const password = this.employeeForm.get('password')?.value;
      const confirmPassword = this.employeeForm.get('confirmPassword')?.value;
      if (!password || !confirmPassword) {
        this.employeeForm.get('password')?.setErrors({ required: true });
        this.employeeForm.get('confirmPassword')?.setErrors({ required: true });
        this.currentStep.set(6);
        alert('Please set username and password for employee login.');
        return;
      }
      if (String(password) !== String(confirmPassword)) {
        this.currentStep.set(6);
        alert('Password and confirm password do not match.');
        return;
      }
    }

    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      const payload = this.buildEmployeePayload(formData);
      const id = this.route.snapshot.paramMap.get('id');

      try {
        if (this.isEditMode() && id) {
          await this.employeeService.updateEmployee(id, payload);
          alert('Employee updated successfully!');
        } else {
          await this.employeeService.createEmployee(payload);
          alert('Employee created successfully!');
        }
        this.router.navigate(['/employees']);
      } catch (error) {
        console.error('Error saving employee:', error);
        alert('Failed to save employee data.');
      }
    } else {
      this.employeeForm.markAllAsTouched();
      this.goToFirstInvalidStep();
      alert('Please fill all required fields in the highlighted step.');
    }
  }

  private goToFirstInvalidStep(): void {
    const stepRequiredFields: string[][] = [
      ['firstName', 'lastName', 'gender', 'dateOfBirth'],
      ['officialEmail', 'mobileNumber'],
      ['department', 'designation', 'employmentType', 'dateOfJoining', 'workLocation'],
      ['basicSalary'],
      [],
      [],
      ['username', 'role'],
      []
    ];

    const firstInvalidStep = stepRequiredFields.findIndex((fields) =>
      fields.some((fieldName) => this.employeeForm.get(fieldName)?.invalid)
    );

    if (firstInvalidStep >= 0) {
      this.currentStep.set(firstInvalidStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private buildEmployeePayload(formData: any): Partial<Employee> {
    const payload: any = {
      employeeId: formData.employeeId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      avatar: this.profilePhotoPreview() || null,
      profilePhoto: this.profilePhotoPreview() || null,
      documents: this.uploadedDocuments(),
      email: formData.officialEmail,
      phone: formData.mobileNumber,
      department: formData.department,
      designation: formData.designation,
      employmentType: formData.employmentType || EmploymentType.PERMANENT,
      employmentStatus: formData.employmentStatus || EmployeeStatus.ACTIVE,
      workLocation: formData.workLocation || WorkLocationType.OFFICE,
      shift: formData.shift || ShiftType.MORNING,
      dateOfJoining: formData.dateOfJoining,
      dateOfBirth: formData.dateOfBirth || null,
      salary: Number(formData.basicSalary || 0),
      isActive: formData.loginStatus !== 'disabled',
      user: {
        username: formData.username,
        password: formData.password,
        roleName: formData.role,
      }
    };

    // Avoid overwriting password on edit unless explicitly set.
    if (this.isEditMode() && !formData.password) {
      delete payload.user.password;
    }
    return payload;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private async readImageAsCompressedDataUrl(file: File): Promise<string> {
    const source = await this.readFileAsDataUrl(file);
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 480;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');

        if (!context) {
          resolve(source);
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      image.onerror = () => resolve(source);
      image.src = source;
    });
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      // Navigate back to employee list
      window.history.back();
    }
  }
}
