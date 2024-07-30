import { Injectable } from '@angular/core';
import { Subscription } from '../../../interfaces/interface'; // Assurez-vous d'importer l'interface Subscription

@Injectable({
  providedIn: 'root',
})
export class ExepensesService {
  expensesMonth: number = 0;
  expensesYear: number = 0;
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth() + 1;
  currentYear: number = this.currentDate.getFullYear();

  constructor() {}

  // Calcule des dépenses total par mois
  getCurrentExpensesMonth(subscriptions: Subscription[]) {
    this.expensesMonth = 0;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      console.log("Pas d'abonnements ou subscriptions n'est pas un tableau");
      return 0;
    }

    for (const subscription of subscriptions) {
      const paymentHistory = Object.values(subscription.paymentHistory);
      const nextPaymentDate = new Date(
        subscription.nextPaymentDate
      );

      let mostRecentPayment: any = null;

      if (paymentHistory.length > 0) {
        mostRecentPayment = paymentHistory.reduce((prev, current) => {
          const prevDate = new Date(prev.date);
          const currentDate = new Date(current.date);
          return prevDate > currentDate ? prev : current;
        });
      }

      if (mostRecentPayment) {
        const mostRecentPaymentMonth =
          new Date(mostRecentPayment.date).getMonth() + 1;
        if (
          mostRecentPaymentMonth === this.currentMonth &&
          typeof mostRecentPayment.amount === 'number'
        ) {
          this.expensesMonth += mostRecentPayment.amount;
        } else if (
          nextPaymentDate.getMonth() + 1 === this.currentMonth &&
          typeof subscription.amount === 'number'
        ) {
          this.expensesMonth += subscription.amount;
        }
      } else if (
        nextPaymentDate.getMonth() + 1 === this.currentMonth &&
        typeof subscription.amount === 'number'
      ) {
        this.expensesMonth += subscription.amount;
      }
    }

    this.expensesMonth = parseFloat(this.expensesMonth.toFixed(2));
    return this.expensesMonth;
  }

  // Calcule des dépenses total par année
  getCurrentExpensesYear(subscriptions: Subscription[]) {
    this.expensesYear = 0;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      console.log("Pas d'abonnements ou subscriptions n'est pas un tableau");
      return 0;
    }

    for (const subscription of subscriptions) {
      const paymentHistory = Object.values(subscription.paymentHistory);
      if (paymentHistory.length === 0) {
        subscription.amount = 0
      }
      paymentHistory.forEach((element: any) => {
        const paymentHistoryYear = new Date(
          element.date
        ).getFullYear();
        if (
          paymentHistoryYear === this.currentYear &&
          typeof element.amount === 'number'
        ) {
          this.expensesYear += element.amount;
        }
      });

      const nextPaymentDate = new Date(
        subscription.nextPaymentDate
      );

      let paymentsLeft = 0;

      switch (subscription.renewal) {
        case 'monthly':
          paymentsLeft = 12 - this.currentMonth;
          break;
        case 'quarterly':
          paymentsLeft = Math.ceil((12 - this.currentMonth) / 3);
          break;
        case 'semi-annual':
          paymentsLeft = Math.ceil((12 - this.currentMonth) / 6);
          break;
        case 'annual':
          if (nextPaymentDate.getFullYear() === this.currentYear) {
            paymentsLeft = 1;
          }
          break;
        case 'weekly':
          const remainingWeeks = Math.ceil(
            (new Date(this.currentYear, 11, 31).getTime() -
              this.currentDate.getTime()) /
              (1000 * 60 * 60 * 24 * 7)
          );
          paymentsLeft = remainingWeeks;
          break;
        default:
          paymentsLeft = 0;
      }

      this.expensesYear += paymentsLeft * subscription.amount;
    }

    this.expensesYear = parseFloat(this.expensesYear.toFixed(2));
    return this.expensesYear;
  }
}
