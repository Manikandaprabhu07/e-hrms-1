import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { UserMenuComponent } from './user-menu.component';
import { ChatbarComponent } from './chatbar.component';
import { ChatbarService, EmployeeService, ThemeService } from '../../core/services';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SidebarComponent,
    UserMenuComponent,
    ChatbarComponent,
  ],
  template: `
    <div class="layout-wrapper">
      <app-sidebar (collapsedChange)="onSidebarCollapse($event)"></app-sidebar>

      <div class="main-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
        <header class="top-header">
          <div class="header-left">
            <div class="search-box">
              <div class="search-badge">Search</div>
              <span class="search-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
                  <path d="M16 16L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search employees, payroll, training..."
                class="search-input"
                [ngModel]="searchText()"
                (ngModelChange)="onSearchInput($event)"
                (focus)="searchOpen.set(true); onSearchChange()"
                (blur)="onSearchBlur()"
              />
              <span class="search-shortcut">Ctrl K</span>
            </div>

            @if (searchOpen() && normalizedSearch().length > 0) {
              <div class="search-popover">
                @if (isSearching()) {
                  <div class="search-empty">Searching...</div>
                } @else if (searchResults().length === 0) {
                  <div class="search-empty">No data found</div>
                } @else {
                  @for (result of searchResults(); track result.key) {
                    <button class="search-item" (mousedown)="goSearch(result)">
                      <div class="s-title">{{ result.title }}</div>
                      <div class="s-meta">{{ result.meta }}</div>
                    </button>
                  }
                }
              </div>
            }
          </div>

          <div class="header-right">
            <button class="theme-btn" type="button" (click)="toggleTheme()">
              <span class="theme-icon" aria-hidden="true">
                @if (isDarkTheme()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3.5V5.5M12 18.5V20.5M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M3.5 12H5.5M18.5 12H20.5M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 15.2A7.7 7.7 0 0 1 8.8 4 8.8 8.8 0 1 0 20 15.2Z"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>
              <span class="theme-label">{{ isDarkTheme() ? 'Light' : 'Dark' }}</span>
            </button>
            <button class="notification-btn" (click)="toggleChatbar()">
              <span class="notification-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3a4 4 0 0 0-4 4v1.2c0 .7-.2 1.4-.6 2L6 12.6c-.7 1-.1 2.4 1.1 2.6h9.8c1.2-.2 1.8-1.6 1.1-2.6l-1.4-2.4c-.4-.6-.6-1.3-.6-2V7a4 4 0 0 0-4-4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                  <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                </svg>
              </span>
              @if (badgeCount() > 0) {
                <span class="notification-badge">{{ badgeCount() }}</span>
              }
            </button>
            <app-user-menu></app-user-menu>
          </div>
        </header>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <app-chatbar></app-chatbar>
  `,
  styles: [
    `
      .layout-wrapper {
        display: flex;
        min-height: 100vh;
        background: transparent;
      }

      .main-container {
        flex: 1;
        margin-left: 240px;
        display: flex;
        flex-direction: column;
        transition: margin-left 0.3s ease;
        width: calc(100% - 240px);
      }

      .main-container.sidebar-collapsed {
        margin-left: 70px;
        width: calc(100% - 70px);
      }

      .top-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 24px;
        background: var(--surface-glass);
        box-shadow: 0 14px 40px var(--shadow-soft);
        border-bottom: 1px solid var(--border-soft);
        backdrop-filter: blur(18px);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-left {
        flex: 1;
        max-width: 560px;
        position: relative;
      }

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface-elevated);
        border: 1px solid var(--border-accent-soft);
        border-radius: 18px;
        padding: 12px 14px;
        box-shadow:
          inset 0 1px 0 var(--surface-inset),
          0 12px 30px var(--shadow-accent);
        overflow: hidden;
      }

      .search-box::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          120deg,
          transparent 20%,
          rgba(59, 130, 246, 0.08),
          transparent 80%
        );
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .search-box:focus-within {
        border-color: var(--border-accent-strong);
        box-shadow:
          inset 0 1px 0 var(--surface-inset),
          0 18px 40px var(--shadow-accent-strong);
      }

      .search-box:focus-within::after {
        opacity: 1;
      }

      .search-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-accent);
        background: var(--badge-bg);
        z-index: 1;
      }

      .search-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: var(--text-muted);
        z-index: 1;
      }

      .search-input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        outline: none;
        z-index: 1;
      }

      .search-input::placeholder {
        color: var(--text-muted);
      }

      .search-shortcut {
        padding: 4px 8px;
        border-radius: 10px;
        border: 1px solid var(--border-soft);
        background: var(--surface-glass-strong);
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        white-space: nowrap;
        z-index: 1;
      }

      .search-popover {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(520px, calc(100vw - 130px));
        background: var(--surface-glass);
        border: 1px solid var(--border-soft);
        border-radius: 18px;
        box-shadow: 0 24px 50px var(--shadow-strong);
        padding: 8px;
        z-index: 200;
        backdrop-filter: blur(18px);
        animation: searchDrop 0.18s ease;
      }

      .search-item {
        width: 100%;
        text-align: left;
        border: 1px solid rgba(255, 255, 255, 0);
        background: var(--surface-subtle);
        padding: 10px;
        border-radius: 14px;
        cursor: pointer;
      }

      .search-item:hover {
        border-color: var(--border-accent-soft);
        background: var(--surface-hover);
      }

      .s-title {
        font-weight: 900;
        color: var(--text-primary);
        font-size: 13px;
      }

      .s-meta {
        font-weight: 700;
        color: var(--text-muted);
        font-size: 12px;
        margin-top: 2px;
      }

      .search-empty {
        padding: 10px;
        color: var(--text-muted);
        font-weight: 800;
        font-size: 12px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .theme-btn,
      .notification-btn {
        position: relative;
        background: var(--surface-elevated);
        border: 1px solid var(--border-soft);
        cursor: pointer;
        padding: 10px 14px;
        border-radius: 14px;
        transition: background 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 10px 24px var(--shadow-soft);
      }

      .theme-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .theme-btn:hover,
      .notification-btn:hover {
        background: var(--surface-hover);
        box-shadow: 0 16px 28px var(--shadow-accent);
      }

      .theme-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-accent);
      }

      .theme-label {
        color: var(--text-primary);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.04em;
      }

      .notification-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-accent);
      }

      .notification-badge {
        position: absolute;
        top: -5px;
        right: -4px;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        background: #ef4444;
        color: white;
        font-size: 11px;
        font-weight: 700;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 18px rgba(239, 68, 68, 0.28);
      }

      .main-content {
        flex: 1;
        padding: 24px;
        overflow: hidden;
        width: 100%;
        animation: contentFade 0.45s ease;
      }

      @keyframes searchDrop {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes contentFade {
        from {
          opacity: 0;
          transform: translateY(12px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .main-container {
          margin-left: 70px;
          width: calc(100% - 70px);
        }

        .search-box {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private chatbarService = inject(ChatbarService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  isSidebarCollapsed = signal(false);
  searchText = signal('');
  searchOpen = signal(false);
  searchResults = signal<Array<{ key: string; title: string; meta: string; route: any[] }>>([]);
  isSearching = signal(false);
  normalizedSearch = computed(() => String(this.searchText() || '').trim());
  badgeCount = computed(() => {
    const overview = this.chatbarService.overview();
    return (overview?.unreadNotifications || 0) + (overview?.unreadMessages || 0);
  });
  isDarkTheme = computed(() => this.themeService.theme() === 'dark');

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private employeesLoaded = false;

  constructor() {
    void this.chatbarService.loadOverview();
    setInterval(() => void this.chatbarService.loadOverview(), 15000);
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }

  toggleChatbar(): void {
    this.chatbarService.toggle();
    void this.chatbarService.loadOverview();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onSearchBlur(): void {
    setTimeout(() => this.searchOpen.set(false), 120);
  }

  onSearchInput(next: string): void {
    this.searchText.set(next);
    this.searchOpen.set(true);
    this.onSearchChange();
  }

  onSearchChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.isSearching.set(true);
    this.searchTimer = setTimeout(() => void this.recomputeSearch(), 160);
  }

  private async recomputeSearch(): Promise<void> {
    const query = this.normalizedSearch().toLowerCase();
    if (!query) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    if (!this.employeesLoaded && query.length >= 2) {
      try {
        await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 5000 });
        this.employeesLoaded = true;
      } catch {
        // Ignore transient search preload failures.
      }
    }

    const routes: Array<{
      key: string;
      title: string;
      meta: string;
      route: any[];
      tokens: string[];
    }> = [
      {
        key: 'route-dashboard',
        title: 'Dashboard',
        meta: 'Go to Dashboard',
        route: ['/dashboard'],
        tokens: ['dashboard', 'home'],
      },
      {
        key: 'route-employees',
        title: 'Employees',
        meta: 'Employee list',
        route: ['/employees'],
        tokens: ['employee', 'employees', 'staff'],
      },
      {
        key: 'route-leave',
        title: 'Leave',
        meta: 'Leave management',
        route: ['/leave'],
        tokens: ['leave', 'leaves', 'request'],
      },
      {
        key: 'route-attendance',
        title: 'Attendance',
        meta: 'Attendance records',
        route: ['/attendance'],
        tokens: ['attendance', 'present', 'absent'],
      },
      {
        key: 'route-payroll',
        title: 'Payroll',
        meta: 'Payslips and payroll',
        route: ['/payroll'],
        tokens: ['payroll', 'payslip', 'salary'],
      },
      {
        key: 'route-training',
        title: 'Training',
        meta: 'Training sessions',
        route: ['/training'],
        tokens: ['training', 'course', 'development'],
      },
      {
        key: 'route-feedback',
        title: 'Feedback',
        meta: 'Admin feedback inbox',
        route: ['/feedback'],
        tokens: ['feedback', 'suggestion', 'complaint'],
      },
      {
        key: 'route-settings',
        title: 'Settings',
        meta: 'Account settings',
        route: ['/account-settings'],
        tokens: ['settings', 'account'],
      },
    ];

    const routeMatches = routes
      .filter(
        (route) =>
          route.title.toLowerCase().includes(query) ||
          route.tokens.some((token) => token.includes(query) || query.includes(token)),
      )
      .slice(0, 6)
      .map((route) => ({
        key: route.key,
        title: route.title,
        meta: route.meta,
        route: route.route,
      }));

    const employees = (this.employeeService.employees() || []) as any[];
    const employeeMatches = employees
      .filter((employee) => {
        const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim().toLowerCase();
        const employeeId = String(employee.employeeId || '').toLowerCase();
        const email = String(employee.email || '').toLowerCase();
        return name.includes(query) || employeeId.includes(query) || email.includes(query);
      })
      .slice(0, 8)
      .map((employee) => {
        const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee';
        const employeeId = employee.employeeId || employee.id || '-';
        return {
          key: `emp-${employee.id}`,
          title: name,
          meta: `Employee • ${employeeId}`,
          route: ['/employees', employee.id],
        };
      });

    this.searchResults.set([...routeMatches, ...employeeMatches].slice(0, 10));
    this.isSearching.set(false);
  }

  goSearch(result: { route: any[] }): void {
    this.searchOpen.set(false);
    this.searchText.set('');
    this.isSearching.set(false);
    this.searchResults.set([]);
    this.router.navigate(result.route);
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    const pressedK = event.key.toLowerCase() === 'k';
    if ((event.ctrlKey || event.metaKey) && pressedK) {
      event.preventDefault();
      this.searchOpen.set(true);
      const input = document.getElementById('global-search-input') as HTMLInputElement | null;
      input?.focus();
      this.onSearchChange();
    }
  }
}
