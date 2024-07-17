import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';
import {
  Company,
  CompanySuggestionsService,
} from '../services/companySuggestions/company-suggestions.service';
import { CommonModule } from '@angular/common';
import { collection, doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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
  logo = '';
  domain = '';
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

  constructor(
    private companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router
  ) {}

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
    this.logo = option.logo;
    this.domain = option.domain;
    this.filteredOptions = [];
  }

  async onSubmit() {
    try {
      const user: any = localStorage.getItem('user');
      const localStorageData: any = JSON.parse(user);

      if (!localStorageData || !localStorageData.uid) {
        throw new Error('User ID not found in localStorage');
      }
      const formData = {
        companyName: this.inputModel,
        logo: this.logo,
        domain: this.domain,
        price: this.price,
        category: this.selectedCategory,
        nextPaymentDate: this.nextPaymentDate,
        paymentHistory: [],
        userID: localStorageData.uid,
      };
      const db = getFirestore();
      await setDoc(doc(collection(db, 'subscriptions')), formData);
      this._router.navigate(['/home']);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  // trackByFn(index: number, item: any) {
  //   return item.name;
  // }
}
