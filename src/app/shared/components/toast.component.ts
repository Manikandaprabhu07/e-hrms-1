import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../core/services';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast" [ngClass]="'toast-' + notification().type">
      <div class="toast-content">
        {{ notification().message }}
      </div>
    </div>
  `,
  styles: [`
    .toast {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    }

    .toast-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .toast-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .toast-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .toast-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent {
  notification = input.required<Notification>();
}
