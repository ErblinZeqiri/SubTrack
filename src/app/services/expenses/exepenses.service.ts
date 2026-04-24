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

  public calculateCurrentExpensesMonth(subscriptions: Subscription[]): number {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let expensesMonth = 0;
    for (const subscription of subscriptions) {
      // 1. Additionner les paiements déjà effectués ce mois-ci
      const paymentHistory = this.getPaymentHistory(subscription);
      for (const payment of paymentHistory) {
        const paymentDate = new Date(payment.date);
        if (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        ) {
          expensesMonth += payment.amount;
        }
      }
      // 2. Ajouter le paiement à venir si la prochaine échéance tombe ce mois-ci
      if (subscription.nextPaymentDate) {
        const paymentDate = new Date(subscription.nextPaymentDate);
        if (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        ) {
          expensesMonth += subscription.amount;
        }
      }
    }
    return Number(expensesMonth.toFixed(2));
  }

  public calculateCurrentExpensesYear(subscriptions: Subscription[]): number {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return 0;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    let expensesYear = 0;
    for (const subscription of subscriptions) {
      // 1. Additionner les paiements déjà effectués cette année
      const paymentHistory = this.getPaymentHistory(subscription);
      for (const payment of paymentHistory) {
        const paymentDate = new Date(payment.date);
        if (paymentDate.getFullYear() === currentYear) {
          expensesYear += payment.amount;
        }
      }
      // 2. Ajouter les paiements à venir jusqu'à la fin de l'année ou la deadline
      let endDate: Date | null = null;
      if (subscription.deadline && subscription.deadline !== 'indetermine' && subscription.deadline !== 'indéterminé') {
        endDate = new Date(subscription.deadline);
      }
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      const lastDate = endDate && endDate < endOfYear ? endDate : endOfYear;
      let count = 0;
      let freq = 0;
      switch (subscription.renewal) {
        case 'Mensuel':
          freq = 1;
          break;
        case 'Annuel':
          freq = 12;
          break;
        case 'Hebdomadaire':
          freq = 1/4.34524;
          break;
        case 'Trimestriel':
          freq = 3;
          break;
        case 'Semestriel':
          freq = 6;
          break;
        case 'Quotidien':
          freq = 1/30.44;
          break;
        default:
          freq = 0;
      }
      if (freq > 0) {
        let next = subscription.nextPaymentDate ? new Date(subscription.nextPaymentDate) : now;
        while (next <= lastDate) {
          if (next.getFullYear() === currentYear) {
            count++;
          }
          switch (subscription.renewal) {
            case 'Mensuel':
              next.setMonth(next.getMonth() + 1);
              break;
            case 'Annuel':
              next.setFullYear(next.getFullYear() + 1);
              break;
            case 'Hebdomadaire':
              next.setDate(next.getDate() + 7);
              break;
            case 'Trimestriel':
              next.setMonth(next.getMonth() + 3);
              break;
            case 'Semestriel':
              next.setMonth(next.getMonth() + 6);
              break;
            case 'Quotidien':
              next.setDate(next.getDate() + 1);
              break;
          }
        }
      }
      expensesYear += (subscription.amount * count);
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
