import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'smartAmount',
  standalone: true,
})
export class SmartAmountPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const isRound = value % 1 === 0;
    const format = isRound ? '1.0-0' : '1.2-2';

    return formatNumber(value, 'de-CH', format);
  }
}
