import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export const CURRENCIES = [
  { code: 'CHF', label: 'Franc suisse', symbol: 'CHF' },
  { code: 'EUR', label: 'Euro',         symbol: '€'   },
  { code: 'USD', label: 'Dollar US',    symbol: '$'   },
  { code: 'GBP', label: 'Livre sterling', symbol: '£' },
  { code: 'CAD', label: 'Dollar canadien', symbol: 'CA$' },
];

const CURRENCY_KEY = 'pref_currency';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private currencySubject = new BehaviorSubject<string>('CHF');
  readonly currency$ = this.currencySubject.asObservable();

  constructor() {
    this.load();
  }

  get currency(): string {
    return this.currencySubject.value;
  }

  async setCurrency(code: string): Promise<void> {
    await Preferences.set({ key: CURRENCY_KEY, value: code });
    this.currencySubject.next(code);
  }

  private async load(): Promise<void> {
    const { value } = await Preferences.get({ key: CURRENCY_KEY });
    if (value) this.currencySubject.next(value);
  }
}
