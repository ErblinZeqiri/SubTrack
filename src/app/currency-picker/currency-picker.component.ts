import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonList, IonItem, IonLabel, IonIcon,
  IonButton, IonButtons, ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';
import { CURRENCIES, Currency } from '../services/preferences/user-preferences.service';

@Component({
  selector: 'app-currency-picker',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonList, IonItem, IonLabel, IonIcon,
    IonButton, IonButtons,
  ],
  templateUrl: './currency-picker.component.html',
  styleUrls: ['./currency-picker.component.scss'],
})
export class CurrencyPickerComponent implements OnInit {
  @Input() selectedCurrency = 'CHF';

  searchQuery = '';

  readonly popularCurrencies: Currency[] = CURRENCIES.filter(c => c.popular);
  readonly allCurrencies: Currency[] = CURRENCIES;

  get filteredPopular(): Currency[] {
    return this.popularCurrencies.filter(c => this.matches(c));
  }

  get filteredAll(): Currency[] {
    return this.allCurrencies.filter(c => this.matches(c));
  }

  get showPopularSection(): boolean {
    return this.searchQuery.trim() === '' || this.filteredPopular.length > 0;
  }

  get showAllSection(): boolean {
    return this.searchQuery.trim() === '' || this.filteredAll.length > 0;
  }

  constructor(private modal: ModalController) {
    addIcons({ closeOutline, checkmarkOutline });
  }

  ngOnInit(): void {}

  private matches(c: Currency): boolean {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q)
    );
  }

  select(code: string): void {
    this.modal.dismiss(code, 'confirm');
  }

  cancel(): void {
    this.modal.dismiss(null, 'cancel');
  }
}
