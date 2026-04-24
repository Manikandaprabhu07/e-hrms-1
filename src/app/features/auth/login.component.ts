import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';

interface DemoMetric {
  label: string;
  value: string;
}

interface DemoScreen {
  title: string;
  accent: string;
  route: string;
  summary: string;
  metrics: DemoMetric[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="demo-background" aria-hidden="true">
        <div class="demo-orb orb-one"></div>
        <div class="demo-orb orb-two"></div>
        <div class="demo-orb orb-three"></div>

        <div class="demo-marquee marquee-top">
          <div class="demo-track">
            @for (screen of loopingScreens; track screen.title + '-top-' + $index) {
              <article class="demo-window" [style.--accent]="screen.accent">
                <header class="demo-window-header">
                  <span class="demo-dot-group">
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                  <span class="demo-route">{{ screen.route }}</span>
                </header>
                <div class="demo-window-body">
                  <div class="demo-window-title-row">
                    <div>
                      <p class="demo-kicker">Live Workspace</p>
                      <h3>{{ screen.title }}</h3>
                    </div>
                    <span class="demo-chip">{{ screen.summary }}</span>
                  </div>

                  <div class="demo-metric-grid">
                    @for (metric of screen.metrics; track metric.label) {
                      <div class="demo-metric-card">
                        <span>{{ metric.label }}</span>
                        <strong>{{ metric.value }}</strong>
                      </div>
                    }
                  </div>

                  <div class="demo-chart">
                    <span class="demo-bar tall"></span>
                    <span class="demo-bar mid"></span>
                    <span class="demo-bar short"></span>
                    <span class="demo-bar tall delay"></span>
                    <span class="demo-bar mid"></span>
                  </div>
                </div>
              </article>
            }
          </div>
        </div>

        <div class="demo-marquee marquee-bottom">
          <div class="demo-track reverse">
            @for (screen of loopingScreens; track screen.title + '-bottom-' + $index) {
              <article class="demo-window compact" [style.--accent]="screen.accent">
                <header class="demo-window-header">
                  <span class="demo-route">{{ screen.title }}</span>
                  <span class="demo-status">Auto Preview</span>
                </header>
                <div class="demo-window-body">
                  <div class="demo-stat-stack">
                    @for (metric of screen.metrics; track metric.label) {
                      <div class="demo-stat-line">
                        <span>{{ metric.label }}</span>
                        <strong>{{ metric.value }}</strong>
                      </div>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        </div>
      </div>

      <div class="page-overlay"></div>

      <div class="login-shell" [class.form-open]="showLoginForm()">
        <section class="hero-panel">
          <div class="hero-badge">E-HRMS Portal</div>
          <h1>Bring your full workspace to the login experience.</h1>
          <p>
            A cleaner sign-in journey, a smoother reveal into the form, and a polished product
            demo moving behind it like a launch video.
          </p>

          <div class="hero-highlights">
            <div class="hero-highlight-card">
              <span>Dashboard</span>
              <strong>Operations snapshot in seconds</strong>
            </div>
            <div class="hero-highlight-card">
              <span>Employees</span>
              <strong>Profiles, documents, and role access</strong>
            </div>
            <div class="hero-highlight-card">
              <span>Attendance & Payroll</span>
              <strong>Track work time, approvals, and salary flow</strong>
            </div>
          </div>
        </section>

        <section class="access-panel">
          <div class="access-card" [class.form-open]="showLoginForm()">
            <div class="access-card-glow" aria-hidden="true"></div>
            <div class="access-slider" [class.form-open]="showLoginForm()">
              <div class="cta-panel" [attr.inert]="showLoginForm() ? '' : null">
                <div class="cta-topline">
                  <div class="cta-icon-wrap">
                    <div class="cta-icon">HR</div>
                    <div class="cta-pulse"></div>
                  </div>
                </div>

                <div class="cta-copy">
                  <p class="cta-label">Secure Entry</p>
                  <h2>Sign in to continue.</h2>
                  <p class="cta-text">
                    Access your HR workspace with a cleaner, focused sign-in flow.
                  </p>
                </div>

                <div class="cta-actions">
                  <button type="button" class="btn-primary cta-button" (click)="openLoginForm()">
                    Sign In
                  </button>
                  <p class="cta-hint">Fast access to your dashboard</p>
                </div>
              </div>

              <div class="form-panel" [attr.inert]="showLoginForm() ? null : ''">
                <div class="form-header">
                  <div>
                    <div class="form-eyebrow">Welcome Back</div>
                    <h2>Sign in to E-HRMS</h2>
                    <p class="form-subtitle">Use your email or employee ID and password.</p>
                  </div>
                  <button type="button" class="btn-ghost" (click)="closeLoginForm()">Back</button>
                </div>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="form-group">
                    <label for="email">Email or Employee ID</label>
                    <input
                      id="email"
                      type="text"
                      formControlName="email"
                      placeholder="user@company.com or EMP001"
                      class="form-input"
                    />
                    @if (emailControl()?.invalid && (emailControl()?.dirty || emailControl()?.touched)) {
                      <span class="error-text">Email or ID is required.</span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-row">
                      <input
                        id="password"
                        [type]="showPassword() ? 'text' : 'password'"
                        formControlName="password"
                        placeholder="Enter your password"
                        class="form-input"
                      />
                      <button type="button" class="toggle-btn" (click)="togglePassword()">
                        {{ showPassword() ? 'Hide' : 'Show' }}
                      </button>
                    </div>
                    @if (passwordControl()?.invalid && (passwordControl()?.dirty || passwordControl()?.touched)) {
                      <span class="error-text">Password must be at least 6 characters.</span>
                    }
                  </div>

                  <label class="remember-row">
                    <input type="checkbox" formControlName="rememberMe" />
                    <span>Remember me on this device</span>
                  </label>

                  @if (serverError()) {
                    <div class="error-box">{{ serverError() }}</div>
                  }

                  <div class="form-submit-row">
                    <button
                      type="submit"
                      class="btn-primary submit-btn"
                      [disabled]="loginForm.invalid || isLoading()"
                    >
                      {{ isLoading() ? 'Signing In...' : 'Sign In' }}
                    </button>
                    <p class="submit-note">You will be redirected after sign in.</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected readonly demoScreens: DemoScreen[] = [
    {
      title: 'Dashboard',
      accent: '#38bdf8',
      route: '/dashboard',
      summary: 'Executive overview',
      metrics: [
        { label: 'Headcount', value: '248' },
        { label: 'Present', value: '94%' },
        { label: 'Open Tasks', value: '18' },
        { label: 'Approvals', value: '07' },
      ],
    },
    {
      title: 'Employees',
      accent: '#60a5fa',
      route: '/employees',
      summary: 'People directory',
      metrics: [
        { label: 'Active', value: '231' },
        { label: 'New Joiners', value: '12' },
        { label: 'Departments', value: '09' },
        { label: 'Profiles Done', value: '98%' },
      ],
    },
    {
      title: 'Attendance',
      accent: '#22c55e',
      route: '/attendance',
      summary: 'Daily tracking',
      metrics: [
        { label: 'Checked In', value: '227' },
        { label: 'Late Marks', value: '06' },
        { label: 'Remote', value: '34' },
        { label: 'Leaves', value: '09' },
      ],
    },
    {
      title: 'Payroll',
      accent: '#f59e0b',
      route: '/payroll',
      summary: 'Compensation cycle',
      metrics: [
        { label: 'Processed', value: '96%' },
        { label: 'Pending', value: '09' },
        { label: 'Payslips', value: '231' },
        { label: 'Variance', value: '1.8%' },
      ],
    },
    {
      title: 'Training',
      accent: '#a78bfa',
      route: '/training',
      summary: 'Learning progress',
      metrics: [
        { label: 'Programs', value: '14' },
        { label: 'Completion', value: '82%' },
        { label: 'Certifications', value: '39' },
        { label: 'Upcoming', value: '05' },
      ],
    },
  ];

  protected readonly loopingScreens = [...this.demoScreens, ...this.demoScreens];

  showLoginForm = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  serverError = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  openLoginForm(): void {
    this.showLoginForm.set(true);
  }

  closeLoginForm(): void {
    this.showLoginForm.set(false);
    this.serverError.set(null);
  }

  emailControl() {
    return this.loginForm.get('email');
  }

  passwordControl() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    try {
      const { email, password, rememberMe } = this.loginForm.value;
      const response = await this.authService.login({ email, password, rememberMe });
      if (response) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.serverError.set(error?.error?.message || 'Login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
