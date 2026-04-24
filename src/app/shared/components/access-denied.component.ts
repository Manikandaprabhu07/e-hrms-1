import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <h1>403</h1>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this resource.</p>
        <a routerLink="/dashboard" class="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .access-denied-content {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 72px;
      margin: 0;
      color: #dc3545;
    }

    h2 {
      font-size: 28px;
      margin: 20px 0;
      color: #212529;
    }

    p {
      color: #6c757d;
      margin-bottom: 30px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessDeniedComponent {}
