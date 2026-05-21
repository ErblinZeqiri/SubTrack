import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'smartAmount',
  standalone: true,
})
export class SmartAmountPipe implements PipeTransform {
  /**
   * Formate un montant avec séparateur suisse et suffixe devise.
   * CHF  → 175.- / 9.99.-
   * Autre → 175 EUR / 9.99 EUR
   */
  transform(value: number | null | undefined, currency: string = 'CHF'): string {
    if (value === null || value === undefined) return '';

    const isRound = value % 1 === 0;
    const format = isRound ? '1.0-0' : '1.2-2';
    const formatted = formatNumber(value, 'de-CH', format);

    return currency === 'CHF' ? `${formatted}.-` : `${formatted} ${currency}`;
  }
}
