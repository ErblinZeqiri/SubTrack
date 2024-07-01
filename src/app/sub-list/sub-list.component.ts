import { Component, OnInit } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import { DataService } from "../services/data.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-sub-list",
  standalone: true,
  imports: [],
  templateUrl: "./sub-list.component.html",
  styleUrl: "./sub-list.component.css",
  providers: [DataService],
})
export class SubListComponent implements OnInit {
  user?: User;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data["userData"];
    console.log("User data:", this.user); 
  }
}
