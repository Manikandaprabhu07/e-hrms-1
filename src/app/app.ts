import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService, AuthService, ThemeService } from './core/services';
import { ToastComponent } from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ToastComponent],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      
      <div class="notifications-container">
        @for (notification of notifications(); track notification.id) {
          <app-toast [notification]="notification" />
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-color: #007bff;
      --secondary-color: #6c757d;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --light-color: #f8f9fa;
      --dark-color: #343a40;
      
      --bg-primary: #ffffff;
      --bg-secondary: #e7edf2ff;
      --bg-card: #ffffff;
      
      --text-primary: #212529;
      --text-secondary: #6c757d;
      
      --border-color: #dee2e6;
    }

    .app-container {
      min-height: 100vh;
      background: transparent;
    }

    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private themeService = inject(ThemeService);

  notifications = this.notificationService.notifications;

  ngOnInit(): void {
    this.themeService.initializeTheme();

    // Initialize auth state
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('Application initialized. User authenticated:', isAuthenticated);
  }
}
