import { Component, OnInit } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import { ExepensesService } from "../services/expenses/exepenses.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NgOptimizedImage } from '@angular/common'
import { IonicModule } from "@ionic/angular";
import { addIcons } from "ionicons";

@Component({
  selector: "app-sub-list",
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule, RouterLink],
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
  ) {
    addIcons({})
  }

  ngOnInit(): void {
    this.user = this.route.snapshot.data["data"];
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
