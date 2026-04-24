import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-elevated]="elevated()">
      <div class="card-header" *ngIf="title()">
        <h3 class="card-title">{{ title() }}</h3>
        <ng-content select="[cardActions]"></ng-content>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .card {
      background: var(--bg-card);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card.card-elevated {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-content {
      padding: 16px;
    }
  `]
})
export class CardComponent {
  title = input<string>('');
  elevated = input<boolean>(false);
}
