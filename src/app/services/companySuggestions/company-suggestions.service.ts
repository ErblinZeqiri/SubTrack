import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private logoBaseUrl = 'https://img.logo.dev';
  private logoDevToken = environment.logoDevToken;

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
      if (normalizedLogo.includes('logo.clearbit.com') && domain) {
        return this.buildLogoDevUrl(domain);
      }
      if (normalizedLogo.includes('logo.clearbit.com') && !domain) {
        const extractedDomain = this.extractDomainFromUrl(normalizedLogo);
        return extractedDomain ? this.buildLogoDevUrl(extractedDomain) : '';
      }
      if (normalizedLogo.includes('img.logo.dev') && !normalizedLogo.includes('token=')) {
        const extractedDomain = this.extractDomainFromUrl(normalizedLogo);
        return extractedDomain ? this.buildLogoDevUrl(extractedDomain) : '';
      }
      return normalizedLogo;
    }

    return domain ? this.buildLogoDevUrl(domain) : '';
  }

  private buildLogoDevUrl(domain: string): string {
    if (!this.logoDevToken) {
      return '';
    }

    const safeDomain = domain.trim().toLowerCase();
    return `${this.logoBaseUrl}/${safeDomain}?token=${this.logoDevToken}&format=webp&retina=true&size=128`;
  }

  private extractDomainFromUrl(url: string): string | null {
    try {
      const cleanedUrl = url.split('?')[0];
      const lastSegment = cleanedUrl.split('/').pop();
      return lastSegment ? lastSegment.trim().toLowerCase() : null;
    } catch {
      return null;
    }
  }
}
