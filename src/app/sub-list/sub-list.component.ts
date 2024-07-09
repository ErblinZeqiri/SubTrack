import { Component, OnInit } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import { ExepensesService } from "../services/expenses/exepenses.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-sub-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sub-list.component.html",
  styleUrl: "./sub-list.component.css",
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  user?: User;
  subscriptions?: any;
  monthlyExpenses: number = 0;
  yearlyExpenses: number = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly expenses: ExepensesService,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data["userData"];
    console.log("User data:", this.user);
    this.subscriptions = Object.entries(this.user!.subscriptions).map(
      ([key, value]) => ({
        id: key,
        ...value,
      })
    );
    this.getMonthlyExpenses();
    this.getYearlyExpenses();
  }

  // Utilisée pour optimiser le rendu en suivant les éléments par leur identifiant unique
  trackById(index: number, item: any): string {
    return item.id;
  }

  getMonthlyExpenses() {
    this.monthlyExpenses = this.expenses.getCurrentExpensesMonth(
      this.subscriptions
    );
  }

  getYearlyExpenses() {
    this.yearlyExpenses = this.expenses.getCurrentExpensesYear(
      this.subscriptions
    );
  }

  handleClick(sub: any) {
    this._router.navigate(["/home/sub-details", sub.id]);
    console.log(sub);
  }
}
