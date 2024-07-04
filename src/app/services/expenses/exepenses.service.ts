import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ExepensesService {
  expensesMonth: number = 0;
  expensesYear: number = 0;
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth() + 1;
  currentYear: number = this.currentDate.getFullYear();
  constructor() {}

  //Calcule des dépenses total par mois
  getCurrentExpensesMonth(subscriptions: any) {
    this.expensesMonth = 0;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      console.log("Pas d'abonnements ou subscriptions n'est pas un tableau");
      return 0;
    }

    for (const subscription of subscriptions) {
      const dateArray = subscription.paymentHistory;

      dateArray.forEach((element: any) => {
        const paymentHistoryMonth = new Date(element.date).getMonth() + 1;
        if (
          paymentHistoryMonth === this.currentMonth &&
          typeof subscription.amount === "number"
        ) {
          this.expensesMonth += subscription.amount;
        }
      });
    }

    this.expensesMonth = parseFloat(this.expensesMonth.toFixed(2));
    return this.expensesMonth;
  }

  //Calcule des dépenses total par année
  getCurrentExpensesYear(subscriptions: any) {
    this.expensesYear = 0;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      console.log("Pas d'abonnements ou subscriptions n'est pas un tableau");
      return 0;
    }
    for (const subscription of subscriptions) {
      const dateArray = subscription.paymentHistory;

      dateArray.forEach((element: any) => {
        const paymentHistoryYear = new Date(element.date).getFullYear();
        if (
          paymentHistoryYear === this.currentYear &&
          typeof subscription.amount === "number"
        ) {
          this.expensesYear += subscription.amount;
        }
      });
    }
    this.expensesYear = parseFloat(this.expensesYear.toFixed(2));

    return this.expensesYear;
  }
}
