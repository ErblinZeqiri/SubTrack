import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  Payment,
  Subscription,
} from '../../../interfaces/interface';

@Injectable({
  providedIn: 'root',
})
export class ExepensesService {
  constructor() {}

  // Calcule des dépenses total par mois (Observable)
  getCurrentExpensesMonth(
    subscriptions$: Observable<Subscription[]>
  ): Observable<number> {
    return subscriptions$.pipe(
      map((subscriptions) => this.calculateCurrentExpensesMonth(subscriptions))
    );
  }

  // Calcule des dépenses total par année (Observable)
  getCurrentExpensesYear(
    subscriptions$: Observable<Subscription[]>
  ): Observable<number> {
    return subscriptions$.pipe(
      map((subscriptions) => this.calculateCurrentExpensesYear(subscriptions))
    );
  }

  private calculateCurrentExpensesMonth(subscriptions: Subscription[]): number {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    let expensesMonth = 0;

    for (const subscription of subscriptions) {
      const paymentHistory = this.getPaymentHistory(subscription);
      const nextPaymentDate = new Date(subscription.nextPaymentDate);

      const mostRecentPayment = this.getMostRecentPayment(paymentHistory);
      if (mostRecentPayment) {
        const mostRecentPaymentMonth =
          new Date(mostRecentPayment.date).getMonth() + 1;
        if (mostRecentPaymentMonth === currentMonth) {
          expensesMonth += mostRecentPayment.amount;
          continue;
        }
      }

      if (nextPaymentDate.getMonth() + 1 === currentMonth) {
        expensesMonth += subscription.amount;
      }
    }

    return Number(expensesMonth.toFixed(2));
  }

  private calculateCurrentExpensesYear(subscriptions: Subscription[]): number {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    let expensesYear = 0;

    for (const subscription of subscriptions) {
      const paymentHistory = this.getPaymentHistory(subscription);
      for (const payment of paymentHistory) {
        const paymentHistoryYear = new Date(payment.date).getFullYear();
        if (paymentHistoryYear === currentYear) {
          expensesYear += payment.amount;
        }
      }

      const nextPaymentDate = new Date(subscription.nextPaymentDate);
      const paymentsLeft = this.getPaymentsLeft(
        subscription.renewal,
        currentMonth,
        currentYear,
        currentDate,
        nextPaymentDate
      );

      expensesYear += paymentsLeft * subscription.amount;
    }

    return Number(expensesYear.toFixed(2));
  }

  private getPaymentHistory(subscription: Subscription): Payment[] {
    return Object.values(subscription.paymentHistory || {});
  }

  private getMostRecentPayment(payments: Payment[]): Payment | null {
    if (!payments.length) {
      return null;
    }

    return payments.reduce((prev, current) => {
      const prevDate = new Date(prev.date);
      const currentDate = new Date(current.date);
      return prevDate > currentDate ? prev : current;
    });
  }

  private getPaymentsLeft(
    renewal: string,
    currentMonth: number,
    currentYear: number,
    currentDate: Date,
    nextPaymentDate: Date
  ): number {
    switch (renewal) {
      case 'Mensuel':
      case 'monthly':
        return 12 - currentMonth;
      case 'Trimestriel':
      case 'quarterly':
        return Math.ceil((12 - currentMonth) / 3);
      case 'Semestriel':
      case 'semi-annual':
        return Math.ceil((12 - currentMonth) / 6);
      case 'Annuel':
      case 'annual':
        return nextPaymentDate.getFullYear() === currentYear ? 1 : 0;
      case 'Hebdomadaire':
      case 'weekly': {
        const remainingWeeks = Math.ceil(
          (new Date(currentYear, 11, 31).getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
        return remainingWeeks;
      }
      default:
        return 0;
    }
  }
}
