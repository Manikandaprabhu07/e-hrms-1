import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" *ngIf="isLoading()">
      <div class="spinner"></div>
      <p *ngIf="message()" class="spinner-text">{{ message() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid var(--border-color);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    .spinner-text {
      margin-top: 12px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  isLoading = input<boolean>(true);
  message = input<string>('');
}
