import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'e-hrms-theme';
  readonly theme = signal<ThemeMode>('light');

  initializeTheme(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const stored = this.getStoredTheme();
    const resolvedTheme = stored ?? 'light';
    this.applyTheme(resolvedTheme);
  }

  toggleTheme(): void {
    this.applyTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(theme: ThemeMode): void {
    this.theme.set(theme);

    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', theme === 'dark');
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private getStoredTheme(): ThemeMode | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'dark' || stored === 'light' ? stored : null;
  }
}
