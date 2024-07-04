import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-sub-details",
  standalone: true,
  imports: [],
  templateUrl: "./sub-details.component.html",
  styleUrl: "./sub-details.component.css",
})
export class SubDetailsComponent implements OnInit {
  subId!: string;
  constructor(private _route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subId = this._route.snapshot.params["subId"];
    console.log("ID de l'abonnement:", this.subId);
  }
}
