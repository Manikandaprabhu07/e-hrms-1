# E-HRMS Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Run tests with coverage
ng test --code-coverage

# Generate a new component
ng generate component features/my-feature/my-component --standalone

# Generate a new service
ng generate service core/services/my-service
```

---

## 📂 Project File Structure Quick Reference

```
src/app/
├── core/
│   ├── models/              # Data models & interfaces
│   │   ├── common.model.ts
│   │   ├── user.model.ts
│   │   ├── employee.model.ts
│   │   ├── payroll.model.ts
│   │   ├── attendance.model.ts
│   │   ├── leave.model.ts
│   │   └── performance.model.ts
│   │
│   ├── services/            # Business logic services (all with Signals)
│   │   ├── auth.service.ts
│   │   ├── employee.service.ts
│   │   ├── payroll.service.ts
│   │   ├── attendance.service.ts
│   │   ├── leave.service.ts
│   │   ├── performance.service.ts
│   │   ├── notification.service.ts
│   │   ├── settings.service.ts
│   │   └── error-handling.service.ts
│   │
│   ├── guards/             # Route protection
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   │
│   └── interceptors/       # HTTP interceptors
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
│
├── features/               # Lazy-loaded feature modules
│   ├── auth/
│   │   ├── login.component.ts
│   │   └── register.component.ts
│   │
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   │
│   ├── employees/
│   │   ├── employees.routes.ts
│   │   ├── employees-list.component.ts
│   │   ├── employee-detail.component.ts
│   │   └── employee-form.component.ts
│   │
│   ├── payroll/
│   │   ├── payroll.routes.ts
│   │   └── payroll-list.component.ts
│   │
│   ├── attendance/
│   │   ├── attendance.routes.ts
│   │   └── attendance-list.component.ts
│   │
│   ├── leave/
│   │   ├── leave.routes.ts
│   │   └── leave-list.component.ts
│   │
│   └── performance/
│       ├── performance.routes.ts
│       └── performance-list.component.ts
│
├── shared/                 # Shared components & utilities
│   ├── components/
│   │   ├── card.component.ts
│   │   ├── pagination.component.ts
│   │   ├── toast.component.ts
│   │   ├── loading-spinner.component.ts
│   │   └── access-denied.component.ts
│   │
│   └── utils/
│       ├── helpers.ts
│       └── index.ts
│
├── app.routes.ts           # Main routing configuration
├── app.config.ts           # App configuration (interceptors)
├── app.ts                  # Root component
└── app.component.ts        # Alternative naming

Authentication & Authorization:
- AuthService with signals
- AuthGuard for route protection
- RoleGuard for role-based access
- JWT token management
```

---

## 🎯 Common Patterns

### 1. Using a Service with Signals

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { EmployeeService } from '../../core/services';

@Component({
  selector: 'app-my-component',
  template: `
    <div *ngIf="service.isLoading()">Loading...</div>
    @for (emp of service.employees(); track emp.id) {
      <p>{{ emp.firstName }}</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  service = inject(EmployeeService);
}
```

### 2. Creating a Service

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MyService {
  private http = inject(HttpClient);

  private itemsSignal = signal<Item[]>([]);
  items = this.itemsSignal.asReadonly();

  getItems(): Promise<Item[]> {
    return new Promise((resolve, reject) => {
      this.http.get<Item[]>('/api/items').subscribe({
        next: (data) => {
          this.itemsSignal.set(data);
          resolve(data);
        },
        error: reject
      });
    });
  }
}
```

### 3. Reactive Component with Signals

```typescript
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-my-component',
  template: `
    <div>{{ title() }}</div>
    <button (click)="onSave()">Save</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MyComponent {
  title = input<string>('');
  saved = output<string>();

  onSave() {
    this.saved.emit(this.title());
  }
}
```

### 4. Using Computed Signals

```typescript
import { Component, inject, computed } from '@angular/core';

@Component({...})
export class MyComponent {
  service = inject(MyService);

  // Auto-computed from service signals
  totalItems = computed(() => 
    this.service.items().length
  );

  hasItems = computed(() => 
    this.totalItems() > 0
  );
}
```

### 5. HTTP Request with Error Handling

```typescript
getItems(): Promise<Item[]> {
  return new Promise((resolve, reject) => {
    this.http.get<Item[]>(this.apiUrl).subscribe({
      next: (items) => {
        this.itemsSignal.set(items);
        resolve(items);
      },
      error: (error) => {
        this.errorSignal.set('Failed to load items');
        this.notificationService.error('Failed to load items');
        reject(error);
      }
    });
  });
}
```

---

## 📋 API Endpoints Reference

### Authentication
```
POST   /api/auth/login              Login user
POST   /api/auth/register           Register user
POST   /api/auth/refresh            Refresh token
POST   /api/auth/logout             Logout user
```

### Employees
```
GET    /api/employees               List employees (paginated)
GET    /api/employees/:id           Get employee details
POST   /api/employees               Create employee
PUT    /api/employees/:id           Update employee
DELETE /api/employees/:id           Delete employee
```

### Payroll
```
GET    /api/payroll/slips           List payroll slips
POST   /api/payroll/slips           Generate payroll slip
GET    /api/payroll/salary-structure/:id    Get salary structure
PUT    /api/payroll/salary-structure/:id    Update salary structure
```

### Attendance
```
GET    /api/attendance              Get attendance records
POST   /api/attendance              Mark attendance
GET    /api/attendance/summary      Get attendance summary
```

### Leave
```
GET    /api/leave/requests          Get leave requests
POST   /api/leave/requests          Request leave
GET    /api/leave/balances          Get leave balance
PUT    /api/leave/requests/:id/approve     Approve leave
PUT    /api/leave/requests/:id/reject      Reject leave
```

### Performance
```
GET    /api/performance/appraisals  Get appraisals
GET    /api/performance/appraisals/:id     Get appraisal details
POST   /api/performance/appraisals  Create appraisal
GET    /api/performance/trainings   Get trainings
```

---

## 🔐 Authentication

### Login
```typescript
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});
// Updates auth state and stores token
```

### Check Authentication
```typescript
if (authService.isAuthenticated()) {
  // User is logged in
}

const user = authService.user();
```

### Check Roles/Permissions
```typescript
if (authService.hasRole('admin')) {
  // Show admin features
}

if (authService.hasPermission('employee.create')) {
  // Show create button
}
```

### Logout
```typescript
authService.logout();
// Clears tokens and redirects to login
```

---

## 🎨 Component Template Patterns

### For Loop
```html
@for (item of service.items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### Conditional Rendering
```html
@if (service.isLoading()) {
  <p>Loading...</p>
} @else if (service.error()) {
  <p>Error: {{ service.error() }}</p>
} @else {
  <p>Data loaded</p>
}
```

### Two-Way Binding
```html
<input [(ngModel)]="value" />
```

### Event Binding
```html
<button (click)="onClick()">Click</button>
<input (change)="onChange($event)" />
```

### Class Binding
```html
<div [class.active]="isActive()">Content</div>
<div [ngClass]="{ 'active': isActive(), 'disabled': isDisabled() }">
```

### Style Binding
```html
<div [style.color]="color()">Content</div>
<div [ngStyle]="{ 'background-color': bgColor(), 'padding': '10px' }">
```

---

## 🧪 Testing Quick Tips

### Test Service
```typescript
describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch items', (done) => {
    service.getItems().then(() => {
      expect(service.items().length).toBe(1);
      done();
    });

    const req = httpMock.expectOne('/api/items');
    req.flush([{ id: 1, name: 'Item 1' }]);
  });
});
```

### Test Component
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## 💾 LocalStorage Patterns

### Storing Token
```typescript
localStorage.setItem('accessToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Retrieving Token
```typescript
const token = localStorage.getItem('accessToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

### Clearing Storage
```typescript
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
localStorage.clear(); // Clear all
```

---

## 🔄 State Management Signals Patterns

### Creating Signals
```typescript
private countSignal = signal(0);
count = this.countSignal.asReadonly();
```

### Updating Signals
```typescript
// Set new value
this.countSignal.set(10);

// Update based on current value
this.countSignal.update(current => current + 1);
```

### Computed Signals
```typescript
double = computed(() => this.count() * 2);
```

### Signal Effects (Side effects)
```typescript
effect(() => {
  console.log('Count changed:', this.count());
});
```

---

## 🚀 Performance Tips

1. **Always use OnPush change detection**
   ```typescript
   changeDetection: ChangeDetectionStrategy.OnPush
   ```

2. **Track in @for loops**
   ```html
   @for (item of items; track item.id) { ... }
   ```

3. **Use computed signals instead of methods**
   ```typescript
   // Bad
   getTotal() { return this.items().length; }

   // Good
   total = computed(() => this.items().length);
   ```

4. **Lazy load feature modules**
   - Implemented in app.routes.ts

5. **Unsubscribe from observables** (or use signals)
   - Prefer Signals over RxJS Observables

---

## 🐛 Debugging

### Console Logging
```typescript
console.log('Current state:', this.service.items());
console.log('Loading:', this.service.isLoading());
```

### Signal Debugging
```typescript
effect(() => {
  console.log('Signal updated:', this.mySignal());
});
```

### Network Debugging
- Open Chrome DevTools → Network tab
- Check request headers and response

### Angular DevTools
- Install Angular DevTools browser extension
- Inspect component state and properties

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| ARCHITECTURE.md | Complete architecture guide |
| DEVELOPMENT_GUIDE.md | Practical development examples |
| IMPLEMENTATION_CHECKLIST.md | Phase-wise implementation plan |
| ARCHITECTURE_DIAGRAMS.md | Visual diagrams of system |
| DELIVERY_SUMMARY.md | What has been delivered |
| README.md | Project overview |
| This file | Quick reference |

---

## 🎯 Troubleshooting

### "Cannot find module" Error
```bash
# Restart dev server
ng serve

# Clear cache
rm -rf node_modules
npm install
```

### Signals not updating in template
- Make sure you're using `()` to call the signal
- Check OnPush change detection is enabled
- Verify signal is public/readable

### HTTP requests not working
- Check API URL in service
- Verify token is being sent (AuthInterceptor)
- Check network tab in DevTools

### Authorization errors (403)
- User might not have required role/permission
- Check RoleGuard configuration
- Verify backend permissions

---

## ⚡ Optimization Checklist

- [x] Standalone components (no NgModules)
- [x] OnPush change detection everywhere
- [x] Lazy loading for features
- [x] Signal-based state (no RxJS)
- [x] Computed signals for derived state
- [x] Proper error handling
- [x] Type safety throughout
- [x] Tree-shaking ready

---

## 🔗 Useful Links

- Angular Docs: https://angular.io
- Angular Signals: https://angular.io/guide/signals
- TypeScript: https://www.typescriptlang.org
- RxJS: https://rxjs.dev

---

## 📞 Quick Help

### Need to add a feature?
1. Define models in `core/models/`
2. Create service in `core/services/`
3. Create components in `features/myfeature/`
4. Add routes in `features/myfeature/routes.ts`
5. Add route to `app.routes.ts`

### Need to handle an error?
```typescript
this.errorService.logError(error);
this.notificationService.error('User-friendly message');
```

### Need to make HTTP call?
```typescript
this.http.get<Type>(url).subscribe({
  next: (data) => { /* handle success */ },
  error: (err) => { /* handle error */ }
});
```

### Need to navigate?
```typescript
this.router.navigate(['/path', id]);
this.router.navigateByUrl('/path');
```

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Angular**: 21+
