import { Injectable } from "@angular/core";
import { User } from "../../interfaces/user_interface";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  data?: User;

  constructor(private readonly _http: HttpClient) {}

  async getUserData() {
    if (this.data) {
      const url = '../../assets/user_data.json';
      const request = this._http.get<{ data: User }>(url);
      const value = await firstValueFrom(request);
      this.data = value.data;
      console.log(this.data);
    }
    return this.data;
  }
}
