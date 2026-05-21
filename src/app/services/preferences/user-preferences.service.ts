import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface Currency {
  code: string;
  label: string;
  flag: string;
  popular?: boolean;
}

export const CURRENCIES: Currency[] = [
  { code: 'CHF', label: 'Franc suisse',        flag: '🇨🇭', popular: true  },
  { code: 'EUR', label: 'Euro',                flag: '🇪🇺', popular: true  },
  { code: 'USD', label: 'Dollar US',           flag: '🇺🇸', popular: true  },
  { code: 'GBP', label: 'Livre sterling',      flag: '🇬🇧' },
  { code: 'CAD', label: 'Dollar canadien',     flag: '🇨🇦' },
  { code: 'JPY', label: 'Yen japonais',        flag: '🇯🇵' },
  { code: 'AUD', label: 'Dollar australien',   flag: '🇦🇺' },
  { code: 'SEK', label: 'Couronne suédoise',   flag: '🇸🇪' },
  { code: 'NOK', label: 'Couronne norvégienne',flag: '🇳🇴' },
  { code: 'DKK', label: 'Couronne danoise',    flag: '🇩🇰' },
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
