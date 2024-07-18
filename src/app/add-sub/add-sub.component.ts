import { Component, NgModule, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { IonInput } from '@ionic/angular/standalone';
import {
  Company,
  CompanySuggestionsService,
} from '../services/companySuggestions/company-suggestions.service';
import { CommonModule } from '@angular/common';
import { collection, doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-sub',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-sub.component.html',
  styleUrls: ['./add-sub.component.scss'],
})
export class AddSubComponent {
  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  @ViewChild('datetime', { static: false }) datetime!: IonDatetime;
  companySelected = '';
  logo = '';
  domain = '';
  filteredOptions: Company[] = [];
  selectedOption: Company | null = null;
  price: number | undefined;
  selectedCategory: string | undefined;
  selectedRenewal: string | undefined;
  nextPaymentDate: Date | undefined;
  subscriptionCategories: string[] = [
    'Divertissement',
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
  subscriptionRenewal: string[] = [
    'Hebdomadaire',
    'Mensuel',
    'Trimestriel',
    'Semestriel',
    'Annuel',
  ];
  today = new Date();
  selectedDate: Date | undefined = this.today;

  public signinForm!: FormGroup;

  constructor(
    private companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router,
    private loadingCtrl: LoadingController
  ) {
    this.signinForm = new FormGroup({
      companySelected: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      price: new FormControl('', Validators.compose([Validators.required])),
      selectedCategory: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      selectedRenewal: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
      nextPaymentDate: new FormControl(
        '',
        Validators.compose([Validators.required])
      ),
    });
  }

  selectDate() {
    this.datetime.confirm();
    this.selectedDate = this.nextPaymentDate;
  }

  resetDateTime() {
    this.datetime.reset();
    this.selectedDate = this.today;
  }

  onInput(ev: any) {
    const value = ev.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]+/g, '');
    this.companySelected = filteredValue;

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
    this.companySelected = option.name;
    this.logo = option.logo;
    this.domain = option.domain;
    this.filteredOptions = [];
  }

  resetForm() {
    this.signinForm.reset();
    this.logo = '';
    this.domain = '';
  }

  async onSubmit() {
    const user: any = localStorage.getItem('user');
    const localStorageData: any = JSON.parse(user);

    if (!localStorageData || !localStorageData.uid) {
      throw new Error('User ID not found in localStorage');
    }

    if (this.signinForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });
      console.log(this.signinForm.valid);

      const formData = {
        ...this.signinForm.value,
        logo: this.logo,
        domain: this.domain,
        paymentHistory: [],
        userID: localStorageData.uid,
      };

      const db = getFirestore();
      await setDoc(doc(collection(db, 'subscriptions')), formData);

      this.resetForm();
      this._router.navigate(['/home']);
    }
  }
}
