import { Component, ChangeDetectionStrategy, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Array<'ADMIN' | 'EMPLOYEE'>;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed()">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">📊</span>
          @if (!isCollapsed()) {
            <span class="logo-text">E-HRMS</span>
          }
        </div>
        <!-- Hamburger Menu Button -->
        <button class="menu-btn" (click)="toggleCollapse()" [title]="isCollapsed() ? 'Expand menu' : 'Collapse menu'">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            @if (isCollapsed()) {
              <!-- Menu icon (hamburger) -->
              <rect x="2" y="4" width="16" height="2" rx="1"/>
              <rect x="2" y="9" width="16" height="2" rx="1"/>
              <rect x="2" y="14" width="16" height="2" rx="1"/>
            } @else {
              <!-- Close/collapse icon -->
              <rect x="2" y="4" width="16" height="2" rx="1"/>
              <rect x="2" y="9" width="16" height="2" rx="1"/>
              <rect x="2" y="14" width="16" height="2" rx="1"/>
            }
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          @for (item of navItems; track item.route) {
            @if (canShow(item)) {
              <li class="nav-item">
                <a
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                  class="nav-link"
                  [title]="item.label"
                >
                  <span class="nav-icon">{{ item.icon }}</span>
                  @if (!isCollapsed()) {
                    <span class="nav-label">{{ item.label }}</span>
                  }
                </a>
              </li>
            }
          }
        </ul>
      </nav>

      <!-- Bottom Section -->
      <div class="sidebar-footer">
        <ul class="nav-list">
          <li class="nav-item">
            <a routerLink="/account-settings" routerLinkActive="active" class="nav-link" title="Settings">
              <span class="nav-icon">⚙️</span>
              @if (!isCollapsed()) {
                <span class="nav-label">Settings</span>
              }
            </a>
          </li>
          <li class="nav-item">
            <button (click)="logout()" class="nav-link logout-btn" title="Logout">
              <span class="nav-icon">🚪</span>
              @if (!isCollapsed()) {
                <span class="nav-label">Logout</span>
              }
            </button>
          </li>
        </ul>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-right: 1px solid rgba(148, 163, 184, 0.25);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .logo-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .menu-btn {
      background: rgba(255, 255, 255, 0.12);
      border: none;
      color: rgba(255, 255, 255, 0.9);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin: 4px 12px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      border: none;
      background: transparent;
      text-align: left;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
    }

    .nav-link.active {
      background: rgba(59, 130, 246, 0.22);
      color: white;
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.18);
    }

    .nav-icon {
      font-size: 20px;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-footer {
      padding: 16px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      width: 100%;
    }

    /* Collapsed state */
    .sidebar.collapsed .sidebar-header {
      padding: 16px 8px;
      justify-content: center;
    }

    .sidebar.collapsed .logo {
      display: none;
    }

    .sidebar.collapsed .nav-item {
      margin: 4px 8px;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 12px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .logo-text,
      .nav-label {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = signal(false);
  @Output() collapsedChange = new EventEmitter<boolean>();

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Employee Management', icon: '👥', route: '/employees' },
    { label: 'Leave Management', icon: '📋', route: '/leave' },
    { label: 'Attendance', icon: '✅', route: '/attendance' },
    { label: 'Payroll', icon: '💰', route: '/payroll' },
    { label: 'Training', icon: '🎓', route: '/training' },
    { label: 'Feedback', icon: '💬', route: '/feedback', roles: ['ADMIN'] }
  ];

  canShow(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.some((r) => this.authService.hasRole(r));
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
    this.collapsedChange.emit(this.isCollapsed());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


