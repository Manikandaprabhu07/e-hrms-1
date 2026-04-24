import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  changePasswordForm!: FormGroup;
  changeEmailForm!: FormGroup;

  isChangingPassword = false;
  isChangingEmail = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  currentUser = this.authService.user;
  isLoading = this.authService.isLoading;
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  constructor() {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Change Password Form
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Change Email Form
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Validator to check if new password and confirm password match
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  /**
   * Handle password change submission
   */
  async onChangePassword(): Promise<void> {
    if (this.changePasswordForm.invalid) {
      this.notificationService.error('Please fill in all required fields correctly');
      return;
    }

    this.isChangingPassword = true;

    try {
      await this.authService.changePassword({
        currentPassword: this.changePasswordForm.value.currentPassword,
        newPassword: this.changePasswordForm.value.newPassword,
        confirmPassword: this.changePasswordForm.value.confirmPassword
      });

      this.notificationService.success('Password changed successfully. Please login again.');
      this.changePasswordForm.reset();
      
      // Logout user after password change
      setTimeout(() => {
        this.authService.logout();
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to change password';
      this.notificationService.error(errorMessage);
    } finally {
      this.isChangingPassword = false;
    }
  }

  /**
   * Handle email change submission
   */
  async onChangeEmail(): Promise<void> {
    if (!this.isAdmin()) {
      this.notificationService.error('Only admins can change email addresses');
      return;
    }

    if (this.changeEmailForm.invalid) {
      this.notificationService.error('Please fill in all required fields correctly');
      return;
    }

    this.isChangingEmail = true;

    try {
      await this.authService.changeEmail({
        newEmail: this.changeEmailForm.value.newEmail,
        password: this.changeEmailForm.value.password
      });

      this.notificationService.success('Email changed successfully');
      this.changeEmailForm.reset();
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Failed to change email';
      this.notificationService.error(errorMessage);
    } finally {
      this.isChangingEmail = false;
    }
  }

  /**
   * Reset password form
   */
  resetPasswordForm(): void {
    this.changePasswordForm.reset();
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
  }

  /**
   * Reset email form
   */
  resetEmailForm(): void {
    this.changeEmailForm.reset();
  }
}
