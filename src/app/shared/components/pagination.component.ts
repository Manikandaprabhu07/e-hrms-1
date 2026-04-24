import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination">
      <button
        [disabled]="currentPage() === 1"
        (click)="onPreviousPage()"
        class="btn btn-sm"
      >
        Previous
      </button>

      <span class="pagination-info">
        Page {{ currentPage() }} of {{ totalPages() }}
      </span>

      <button
        [disabled]="currentPage() === totalPages()"
        (click)="onNextPage()"
        class="btn btn-sm"
      >
        Next
      </button>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .pagination-info {
      font-size: 14px;
      color: var(--text-secondary);
      min-width: 120px;
      text-align: center;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaginationComponent {
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  pageChanged = output<'next' | 'previous'>();

  onNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChanged.emit('next');
    }
  }

  onPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.pageChanged.emit('previous');
    }
  }
}
