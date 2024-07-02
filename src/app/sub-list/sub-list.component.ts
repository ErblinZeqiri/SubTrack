import { Component, OnInit } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import { DataService } from "../services/data.service";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-sub-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sub-list.component.html",
  styleUrl: "./sub-list.component.css",
  providers: [DataService],
})
export class SubListComponent implements OnInit {
  user?: User;
  subscriptions?: any;
  expensesMonth: number = 0;
  expensesYear: number = 0;
  currentDate: Date = new Date();
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data["userData"];
    console.log("User data:", this.user);
    // Convertit les abonnements d'un objet en un tableau d'objets avec leurs identifiants pour une itération facile
    this.subscriptions = Object.entries(this.user!.subscriptions).map(
      ([key, value]) => ({
        id: key,
        ...value,
      })
    );
  }

  // Utilisée pour optimiser le rendu en suivant les éléments par leur identifiant unique
  trackById(index: number, item: any): string {
    return item.id;
  }

  //Calcule des dépenses total par mois et année
  currentExpensesMonth() {
    this.expensesMonth = 0;
    this.expensesYear = 0;

    if (!this.subscriptions || !Array.isArray(this.subscriptions)) {
      console.log("Pas d'abonnements ou subscriptions n'est pas un tableau");
      return 0;
    }

    const currentMonth = this.currentDate.getMonth();

    for (const subscription of this.subscriptions) {
      const paymentDate = new Date(subscription.paymentHistory[0].date);
      console.log(paymentDate.getMonth(), currentMonth)
      console.log(paymentDate)
      if (
        paymentDate.getMonth() === currentMonth &&
        typeof subscription.amount === "number"
      ) {
        this.expensesMonth += subscription.amount;
      }
    }

    this.expensesMonth = parseFloat(this.expensesMonth.toFixed(2));

    console.log("Dépenses totales du mois :", this.expensesMonth);
    return this.expensesMonth;
  }

  currentExpensesYear() {}

  expensesBySub() {}
}
