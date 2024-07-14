import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  name: string;
  domain: string;
  logo: string;
}

@Injectable({
  providedIn: 'root',
})
export class CompanySuggestionsService {
  private apiUrl =
    'https://autocomplete.clearbit.com/v1/companies/suggest?query=';

  constructor(private http: HttpClient) {}

  fetchCompanySuggestions(query: string): Observable<Company[]> {
    const url = `${this.apiUrl}${query}`;
    return this.http.get<Company[]>(url);
  }
}
