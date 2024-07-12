import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "../../interfaces/user_interface";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { addIcons } from "ionicons";
import { arrowBack } from "ionicons/icons";

@Component({
  selector: "app-sub-details",
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: "./sub-details.component.html",
  styleUrl: "./sub-details.component.css",
})
export class SubDetailsComponent implements OnInit {
  user?: User;
  subId!: string;
  subscription?: any;

  constructor(
    private readonly route: ActivatedRoute,
    private _route: ActivatedRoute
  ) {
    addIcons({
      arrowBack,
    });
  }

  ngOnInit(): void {
    this.user = this.route.snapshot.data["userData"];
    this.subId = this._route.snapshot.params["id"];

    this.subscription = this.user!.subscriptions[this.subId];
    console.log(this.subscription);
  }

  trackByPaymentDate(index: number, payment: any): string {
    return payment.date;
  }
}
