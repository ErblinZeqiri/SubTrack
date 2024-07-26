import { Component, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonText,
  IonAvatar,
  IonLabel,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  LoadingController,
  IonSelect,
  IonSelectOption,
  IonDatetime,
} from '@ionic/angular/standalone';
import {
  Company,
  CompanySuggestionsService,
} from '../services/companySuggestions/company-suggestions.service';
import {
  CommonModule,
  DatePipe,
  formatDate,
  registerLocaleData,
} from '@angular/common';
import { collection, doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import localeFrCh from '@angular/common/locales/fr-CH';

registerLocaleData(localeFrCh, 'fr-CH');

@Component({
  selector: 'app-add-sub',
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonButton,
    IonButtons,
    IonLabel,
    IonAvatar,
    IonText,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelect,
    IonSelectOption,
  ],
  providers: [DatePipe],
  templateUrl: './add-sub.component.html',
  styleUrls: ['./add-sub.component.scss'],
})
export class AddSubComponent {
  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  @ViewChild('datetime', { static: false }) datetime!: IonDatetime;
  logo = '';
  domain = '';
  filteredOptions$!: Observable<Company[]>;
  toggleDropdown: boolean = false;
  selectedOption: Company | null = null;
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
  today = formatDate(new Date().toISOString(), 'YYYY-MM-dd', 'fr-CH');
  selectedDate: string | null = this.today;

  signinForm!: FormGroup;
  companySelected = new FormControl(
    '',
    Validators.compose([Validators.required])
  );
  amount = new FormControl('', Validators.compose([Validators.required]));
  selectedCategory = new FormControl(
    '',
    Validators.compose([Validators.required])
  );
  selectedRenewal = new FormControl(
    '',
    Validators.compose([Validators.required])
  );
  nextPaymentDate = new FormControl(
    this.today,
    Validators.compose([Validators.required])
  );
  datePicker = new FormControl();

  constructor(
    private companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router,
    private loadingCtrl: LoadingController
  ) {
    this.signinForm = new FormGroup({
      companySelected: this.companySelected,
      amount: this.amount,
      selectedCategory: this.selectedCategory,
      selectedRenewal: this.selectedRenewal,
      nextPaymentDate: this.nextPaymentDate,
    });
    console.log(this.today)
  }

  selectDate() {
    this.datetime.confirm();
    if (this.nextPaymentDate.value) {
      this.selectedDate = this.nextPaymentDate.value;
    }
  }

  resetDateTime() {
    this.datetime.reset();
    this.nextPaymentDate.setValue(this.today);
    if (this.nextPaymentDate.value) {
      this.selectedDate = this.nextPaymentDate.value;
    }
  }

  onInput(ev: any) {
    const value = ev.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]+/g, '');

    if (filteredValue.length > 1) {
      this.filteredOptions$ =
        this.companySuggestionsService.fetchCompanySuggestions(filteredValue);
      this.toggleDropdown = true;
    }
  }

  selectOption(option: Company) {
    this.companySelected.setValue(option.name);
    this.logo = option.logo;
    this.domain = option.domain;
    this.toggleDropdown = false;
  }

  resetForm() {
    this.signinForm.reset();
    this.logo = '';
    this.domain = '';
    this.resetDateTime();
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
