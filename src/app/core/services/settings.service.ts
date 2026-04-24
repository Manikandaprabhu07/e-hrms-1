import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  dateFormat: string;
  timeFormat: 'h12' | 'h24';
  pageSize: number;
  autoSaveInterval: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private defaultSettings: AppSettings = {
    theme: 'light',
    language: 'en',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'h24',
    pageSize: 10,
    autoSaveInterval: 5000
  };

  private settingsSignal = signal<AppSettings>(this.defaultSettings);
  settings = this.settingsSignal.asReadonly();

  isDarkMode = computed(() => this.settingsSignal().theme === 'dark');

  constructor() {
    this.loadSettings();
  }

  /**
   * Load settings from local storage or API
   */
  private loadSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedSettings = localStorage.getItem('appSettings');

    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        this.settingsSignal.set({ ...this.defaultSettings, ...settings });
      } catch (error) {
        console.error('Failed to parse stored settings', error);
      }
    }
  }

  /**
   * Update specific setting
   */
  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      [key]: value
    }));
    this.saveSettings();
  }

  /**
   * Update multiple settings
   */
  updateSettings(updates: Partial<AppSettings>): void {
    this.settingsSignal.update(settings => ({
      ...settings,
      ...updates
    }));
    this.saveSettings();
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    this.settingsSignal.set(this.defaultSettings);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('appSettings');
    }
    console.log('Settings reset to defaults');
  }

  /**
   * Save settings to local storage
   */
  private saveSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem('appSettings', JSON.stringify(this.settingsSignal()));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  }
}
