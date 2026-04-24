import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components';
import { AuthService, EventService } from '../../core/services';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
}

interface CalendarDay {
  iso: string;
  label: number;
  isCurrentMonth: boolean;
  events: EventItem[];
}

@Component({
  selector: 'app-events-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="page-header">
      <h1>Events Calendar</h1>
      <p class="subtitle">Browse upcoming events and view details by date.</p>
      <button class="btn-primary" (click)="refresh()">Refresh</button>
    </div>

    <main class="dashboard-main">
      <app-card [title]="monthLabel()" [elevated]="true">
        <div class="calendar-header">
          <button class="calendar-nav" (click)="prevMonth()">←</button>
          <div class="calendar-month">{{ monthLabel() }}</div>
          <button class="calendar-nav" (click)="nextMonth()">→</button>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekday" *ngFor="let day of weekDays">{{ day }}</div>
          @for (week of calendarWeeks(); track week[0].iso) {
            @for (day of week; track day.iso) {
              <button
                class="calendar-cell"
                [class.other-month]="!day.isCurrentMonth"
                [class.selected]="day.iso === selectedDate()"
                (click)="selectDate(day.iso)"
              >
                <span class="calendar-day">{{ day.label }}</span>
                @if (day.events.length > 0) {
                  <span class="event-dot" title="{{ day.events.length }} event(s)"></span>
                }
              </button>
            }
          }
        </div>

        <div class="selected-events">
          <div class="selected-events-header">
            <h3>{{ selectedDateLabel() }}</h3>
            <button class="btn-secondary" (click)="showPopup.set(true)" *ngIf="selectedDate()">
              View in popup
            </button>
          </div>

          @if (selectedDayEvents().length === 0) {
            <p class="muted">No events for this date.</p>
          } @else {
            @for (event of selectedDayEvents(); track event.id) {
              <div class="event-item">
                <div class="event-info">
                  <h4>{{ event.title }}</h4>
                  @if (event.description) {
                    <p class="muted">{{ event.description }}</p>
                  }
                </div>
              </div>
            }
          }
        </div>

        <div class="popup-overlay" *ngIf="showPopup()" (click)="closePopup()">
          <div class="popup" (click)="$event.stopPropagation()">
            <div class="popup-header">
              <h3>{{ selectedDateLabel() }}</h3>
              <button class="btn-close" (click)="closePopup()" aria-label="Close popup">×</button>
            </div>

            <div class="popup-body">
              @if (isAdmin()) {
                <div class="popup-add-event">
                  <h4>Add new event</h4>
                  <input type="text" placeholder="Title" [ngModel]="popupNewTitle()" (ngModelChange)="popupNewTitle.set($event)" />
                  <input type="date" [ngModel]="popupNewDate()" (ngModelChange)="popupNewDate.set($event)" />
                  <textarea rows="2" placeholder="Description (optional)" [ngModel]="popupNewDescription()" (ngModelChange)="popupNewDescription.set($event)"></textarea>
                  <button class="btn-primary" (click)="createEventFromPopup()" [disabled]="popupIsCreating()">
                    {{ popupIsCreating() ? 'Adding…' : 'Add event' }}
                  </button>
                </div>
              }

              @if (selectedDayEvents().length === 0) {
                <p class="muted">No events for this date.</p>
              } @else {
                @for (event of selectedDayEvents(); track event.id) {
                <div class="event-item">
                  @if (editingEventId() !== event.id) {
                    <div class="event-info">
                      <h4>{{ event.title }}</h4>
                      @if (event.description) {
                        <p class="muted">{{ event.description }}</p>
                      }
                    </div>
                  } @else {
                    <div class="event-info">
                      <input class="event-edit-input" type="text" [ngModel]="editTitle()" (ngModelChange)="editTitle.set($event)" />
                      <input class="event-edit-input" type="date" [ngModel]="editDate()" (ngModelChange)="editDate.set($event)" />
                      <textarea class="event-edit-textarea" rows="2" [ngModel]="editDescription()" (ngModelChange)="editDescription.set($event)"></textarea>
                    </div>
                  }

                  @if (isAdmin()) {
                    <div class="event-actions">
                      @if (editingEventId() !== event.id) {
                        <button class="btn-secondary" (click)="startEditing(event)">Edit</button>
                      } @else {
                        <button class="btn-secondary" (click)="saveEdit()" [disabled]="isSavingEdit()">
                          {{ isSavingEdit() ? 'Saving…' : 'Save' }}
                        </button>
                        <button class="btn-secondary" (click)="cancelEdit()">Cancel</button>
                      }
                      <button class="btn-danger" (click)="deleteEvent(event.id)">Delete</button>
                    </div>
                  }
                </div>
              }
              }
            </div>
          </div>
        </div>
      </app-card>
    </main>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      .subtitle {
        margin: 8px 0 12px 0;
        font-size: 14px;
        color: #64748b;
      }

      .dashboard-main {
        max-width: 900px;
      }

      .btn-primary {
        padding: 10px 14px;
        border: none;
        border-radius: 6px;
        background: #1e40af;
        color: white;
        cursor: pointer;
        font-weight: 600;
        margin-top: 12px;
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .calendar-month {
        font-weight: 700;
        font-size: 16px;
      }

      .calendar-nav {
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: white;
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 16px;
      }

      .calendar-weekday {
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }

      .calendar-cell {
        height: 80px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        background: white;
        padding: 8px;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
      }

      .calendar-cell.other-month {
        opacity: 0.45;
      }

      .calendar-cell.selected {
        border-color: #1e40af;
        box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.15);
      }

      .calendar-day {
        font-weight: 700;
        font-size: 13px;
      }

      .event-dot {
        width: 8px;
        height: 8px;
        background: #1e40af;
        border-radius: 50%;
        margin-top: 2px;
      }

      .selected-events {
        margin-top: 16px;
      }

      .selected-events-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .selected-events h3 {
        margin: 0;
        font-size: 16px;
      }

      .btn-secondary {
        border: 1px solid rgba(0, 0, 0, 0.15);
        background: white;
        color: #1e293b;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }

      .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 1000;
      }

      .popup {
        width: min(600px, 100%);
        max-height: 80vh;
        overflow: auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.15);
      }

      .popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .btn-close {
        border: none;
        background: transparent;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .popup-body {
        padding: 16px;
      }

      .event-item {
        padding: 12px;
        border-radius: 8px;
        background: rgba(249, 250, 251, 0.7);
        margin-bottom: 10px;
      }

      .event-info h4 {
        margin: 0 0 6px 0;
        font-size: 14px;
        font-weight: 700;
      }

      .event-edit-input,
      .event-edit-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 13px;
        margin-top: 6px;
      }

      .event-actions {
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .btn-danger {
        border: 1px solid rgba(220, 53, 69, 0.4);
        background: rgba(220, 53, 69, 0.1);
        color: #dc3545;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }

      .btn-danger:hover {
        background: rgba(220, 53, 69, 0.15);
      }

      .muted {
        color: #64748b;
        font-size: 13px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCalendarComponent {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  events = signal<EventItem[]>([]);
  currentMonth = signal(new Date());
  selectedDate = signal<string>('');
  showPopup = signal(false);

  popupNewTitle = signal('');
  popupNewDate = signal('');
  popupNewDescription = signal('');
  popupIsCreating = signal(false);

  editingEventId = signal<string | null>(null);
  editTitle = signal('');
  editDate = signal('');
  editDescription = signal('');
  isSavingEdit = signal(false);

  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthLabel = computed(() => {
    const date = this.currentMonth();
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  private normalizeIso(date: Date): string {
    // Use local date components to avoid timezone shifts when converting to an ISO-style date string.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseIsoToLocalDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map((n) => Number(n));
    return new Date(year, month - 1, day);
  }

  private buildCalendar(): CalendarDay[][] {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const m = month.getMonth();

    const firstOfMonth = new Date(year, m, 1);
    const startDay = firstOfMonth.getDay();

    const startDate = new Date(year, m, 1 - startDay);
    const weeks: CalendarDay[][] = [];

    const eventsByDate = this.eventMap();

    for (let week = 0; week < 6; week++) {
      const days: CalendarDay[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + week * 7 + dow);

        const iso = this.normalizeIso(day);
        const dayEvents = eventsByDate[iso] || [];

        days.push({
          iso,
          label: day.getDate(),
          isCurrentMonth: day.getMonth() === m,
          events: dayEvents,
        });
      }
      weeks.push(days);
    }

    return weeks;
  }

  calendarWeeks = computed(() => this.buildCalendar());

  eventMap = computed(() => {
    const map: Record<string, EventItem[]> = {};
    for (const event of this.events()) {
      const key = event.date;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(event);
    }
    return map;
  });

  selectedDayEvents = computed(() => {
    const iso = this.selectedDate();
    return iso ? this.eventMap()[iso] || [] : [];
  });

  selectedDateLabel = computed(() => {
    const iso = this.selectedDate();
    if (!iso) {
      return 'Select a day to view events';
    }
    const date = this.parseIsoToLocalDate(iso);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  });

  constructor() {
    const today = new Date();
    this.currentMonth.set(new Date(today.getFullYear(), today.getMonth(), 1));
    this.selectedDate.set(this.normalizeIso(today));
    this.refresh();
  }

  async refresh() {
    const events = await this.eventService.getUpcomingEvents();
    this.events.set(events || []);
  }

  async createEventFromPopup() {
    if (!this.popupNewTitle().trim() || !this.popupNewDate().trim()) {
      alert('Please provide both a title and a date for the new event.');
      return;
    }

    this.popupIsCreating.set(true);
    try {
      await this.eventService.createEvent({
        title: this.popupNewTitle().trim(),
        date: this.popupNewDate(),
        description: this.popupNewDescription().trim() || undefined,
      });

      // Refresh events so the calendar updates immediately.
      await this.refresh();

      // Keep the popup open so admins can add multiple events quickly.
      this.popupNewTitle.set('');
      this.popupNewDescription.set('');
    } finally {
      this.popupIsCreating.set(false);
    }
  }

  prevMonth() {
    const cur = this.currentMonth();
    this.currentMonth.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  nextMonth() {
    const cur = this.currentMonth();
    this.currentMonth.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  selectDate(iso: string) {
    this.selectedDate.set(iso);
    this.popupNewDate.set(iso);
    this.popupNewTitle.set('');
    this.popupNewDescription.set('');
    this.showPopup.set(true);
  }

  startEditing(event: EventItem) {
    this.editingEventId.set(event.id);
    this.editTitle.set(event.title);
    this.editDate.set(event.date);
    this.editDescription.set(event.description || '');
  }

  cancelEdit() {
    this.editingEventId.set(null);
  }

  async saveEdit() {
    const id = this.editingEventId();
    if (!id) return;

    if (!this.editTitle().trim() || !this.editDate().trim()) {
      alert('Title and date are required.');
      return;
    }

    this.isSavingEdit.set(true);
    try {
      await this.eventService.updateEvent(id, {
        title: this.editTitle().trim(),
        date: this.editDate(),
        description: this.editDescription().trim() || undefined,
      });
      await this.refresh();
      this.cancelEdit();
    } finally {
      this.isSavingEdit.set(false);
    }
  }

  async deleteEvent(id: string) {
    if (!confirm('Delete this event?')) {
      return;
    }

    await this.eventService.deleteEvent(id);
    await this.refresh();
  }

  closePopup() {
    this.showPopup.set(false);
  }
}
