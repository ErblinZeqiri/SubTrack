import { Injectable } from '@angular/core';
import { User } from '../../../interfaces/user_interface';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  userData?: User;

  constructor(private readonly _http: HttpClient) {}

  async getUserData(): Promise<User> {
    try {
      if (!this.userData) {
        const url = '../../../assets/user_data.json';

        console.log(
          this._http.get(
            'https://api.thecompaniesapi.com/v1/companies/by-name?name=amazonprime?token=subtrack'
          )
        );
        const request = this._http.get<User>(url);
        const value = await firstValueFrom(request);
        this.userData = value;
      }
      return this.userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}
