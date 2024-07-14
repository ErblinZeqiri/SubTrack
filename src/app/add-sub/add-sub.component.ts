import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';
import {
  Company,
  CompanySuggestionsService,
} from '../services/companySuggestions/company-suggestions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-sub',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './add-sub.component.html',
  styleUrls: ['./add-sub.component.scss'],
})
export class AddSubComponent {
  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  inputModel = '';
  filteredOptions: Company[] = [];
  selectedOption: Company | null = null;
  price: number | undefined;
  selectedCategory: string | undefined;
  nextPaymentDate: string | undefined;

  subscriptionCategories: string[] = [
    'Indispensable',
    'Streaming',
    'Presse',
    'Fitness',
    'Jeux',
    'Cuisine',
    'Éducation',
    'Technologie',
    'Mode',
    'Finance',
    'Voyage',
  ];

  constructor(private companySuggestionsService: CompanySuggestionsService) {}

  onInput(ev: any) {
    const value = ev.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]+/g, '');
    this.inputModel = filteredValue;

    if (filteredValue.length > 1) {
      this.companySuggestionsService
        .fetchCompanySuggestions(filteredValue)
        .subscribe((data) => {
          this.filteredOptions = data;
        });
    } else {
      this.filteredOptions = [];
    }
  }

  selectOption(option: Company) {
    this.inputModel = option.name;
    console.log(option)
    this.filteredOptions = [];
  }

  onSubmit() {
    const formData = {
      companyName: this.inputModel,
      price: this.price,
      category: this.selectedCategory,
      nextPaymentDate: this.nextPaymentDate,
    };

    console.log('Données du formulaire soumises :', formData);
  }

  trackByFn(index: number, item: any) {
    return item.name;
  }
}
