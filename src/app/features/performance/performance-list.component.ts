import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-performance-list',
  standalone: true,
  template: '<p>Performance Management Component</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceListComponent {}
