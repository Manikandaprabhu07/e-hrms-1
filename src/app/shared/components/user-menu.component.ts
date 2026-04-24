import { Component, computed, inject, HostListener, ElementRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="user-menu-container">
      <button class="user-menu-btn" (click)="toggleMenu()" type="button" aria-label="User menu">
        <img class="avatar" [src]="userAvatar()" [alt]="user()?.firstName || 'User'" />
        <span class="user-name">{{ user()?.firstName || 'User' }}</span>
        
        <!-- Carbon Chevron Down Icon -->
        <svg class="dropdown-arrow" [class.open]="isOpen()" viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
          <path d="M16 22L6 12h20z"/>
        </svg>
      </button>

      <div class="dropdown-menu" [class.open]="isOpen()">
        <div class="menu-header">
          <p class="email">{{ user()?.email }}</p>
        </div>

        <nav class="menu-items">
          <a routerLink="/account-settings" (click)="onMenuItemClick()" class="menu-item">
            <!-- Carbon Settings Icon -->
            <svg class="icon" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
              <path d="M28.06 19.56L26.5 17.1a9.66 9.66 0 00.12-1.1 9.66 9.66 0 00-.12-1.1l1.56-2.46a.9.9 0 00.22-1.06l-1.48-2.56a.9.9 0 00-1.06-.22l-1.84.74a10 10 0 00-1.9-1.1l-.28-1.96a.9.9 0 00-.88-.76h-2.96a.9.9 0 00-.88.76l-.28 1.96a10 10 0 00-1.9 1.1l-1.84-.74a.9.9 0 00-1.06.22l-1.48 2.56a.9.9 0 00.22 1.06l1.56 2.46a9.66 9.66 0 00-.12 1.1 9.66 9.66 0 00.12 1.1l-1.56 2.46a.9.9 0 00-.22 1.06l1.48 2.56a.9.9 0 001.06.22l1.84-.74a10 10 0 001.9 1.1l.28 1.96a.9.9 0 00.88.76h2.96a.9.9 0 00.88-.76l.28-1.96a10 10 0 001.9-1.1l1.84.74a.9.9 0 001.06-.22l1.48-2.56a.9.9 0 00-.22-1.06zM16 21a5 5 0 115-5 5 5 0 01-5 5z"/>
            </svg>
            Account Settings
          </a>
          <button type="button" (click)="logout()" class="menu-item logout-btn">
            <!-- Carbon Logout Icon -->
            <svg class="icon" viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
              <path d="M18 2h-4a2 2 0 00-2 2v6h2V4h4v24h-4v-6h-2v6a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2z"/>
              <path d="M7.71 15.71L6 14 10 10h-8v2h8l-4 4 1.71 1.71L14 14l-6.29-6.29z"/>
            </svg>
            Logout
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .user-menu-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border-soft);
      border-radius: 14px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      color: var(--text-primary);
      z-index: 1001;
      position: relative;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
      box-shadow: 0 10px 24px var(--shadow-soft);
    }

    .user-menu-btn:hover {
      background: var(--surface-hover);
      border-color: var(--border-accent-soft);
    }

    .icon {
      flex-shrink: 0;
      color: var(--text-muted);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 500;
      display: none;
      margin: 0 0.5rem;
      font-size: 0.875rem;
    }

    @media (min-width: 768px) {
      .user-name {
        display: inline;
      }
    }

    .dropdown-arrow {
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-glass-strong);
      border: 1px solid var(--border-soft);
      border-radius: 18px;
      box-shadow: 0 18px 40px var(--shadow-strong);
      min-width: 240px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
      pointer-events: none;
    }

    .dropdown-menu.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }

    .menu-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-soft);
    }

    .email {
      margin: 0;
      font-size: 0.75rem;
      color: var(--text-muted);
      word-break: break-all;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
    }

    .menu-items {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      color: var(--text-primary);
      transition: background-color 0.2s;
      text-align: left;
      width: 100%;
      font-size: 0.875rem;
      font-family: 'IBM Plex Sans', Arial, sans-serif;
    }

    .menu-item:hover {
      background-color: var(--surface-subtle);
    }

    .logout-btn {
      color: #dc2626;
      border-top: 1px solid var(--border-soft);
    }

    .logout-btn:hover {
      background-color: #fae6e6;
    }

    .logout-btn .icon {
      color: #dc2626;
    }
  `]
})
export class UserMenuComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private employeeService = inject(EmployeeService);

  user = this.authService.user;
  isOpen = signal(false);
  employeePhoto = signal<string | null>(null);
  userAvatar = computed(() => {
    const currentUser = this.user();
    const photo = this.employeePhoto();
    if (photo) {
      return photo;
    }
    const name = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff`;
  });

  async ngOnInit(): Promise<void> {
    if (this.authService.hasRole('EMPLOYEE')) {
      try {
        const employee = await this.employeeService.getMe();
        this.employeePhoto.set((employee as any)?.profilePhoto || (employee as any)?.avatar || null);
      } catch {
        this.employeePhoto.set(null);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isOpen.set(false);
    }
  }

  toggleMenu(): void {
    this.isOpen.update(value => !value);
  }

  onMenuItemClick(): void {
    this.isOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
