import { Component, OnInit } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import {DataService} from '../services/data.service'

@Component({
  selector: "app-sub-list",
  standalone: true,
  imports: [],
  templateUrl: "./sub-list.component.html",
  styleUrl: "./sub-list.component.css",
  providers: [DataService]
})
export class SubListComponent implements OnInit {
  constructor(private readonly _service: DataService){}

  user: User | null = null;
  
  ngOnInit(): void {
    console.log(this._service)
  }
}
