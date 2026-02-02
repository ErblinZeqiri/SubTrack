import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
    return this.http.get<Company[]>(url).pipe(
      map((companies) =>
        companies.map((company) => ({
          ...company,
          logo: this.normalizeLogoUrl(company.logo, company.domain),
        }))
      )
    );
  }

  getLogoUrl(company: Company): string {
    return this.normalizeLogoUrl(company.logo, company.domain);
  }

  private normalizeLogoUrl(logo?: string, domain?: string): string {
    const normalizedLogo = logo?.startsWith('http://')
      ? logo.replace('http://', 'https://')
      : logo;

    if (normalizedLogo) {
      return normalizedLogo;
    }

    return domain ? `https://logo.clearbit.com/${domain}` : '';
  }
}
