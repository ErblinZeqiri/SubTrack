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
  IonDatetimeButton,
  IonModal, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';
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
  imports: [IonRadioGroup, IonRadio, 
    IonModal,
    IonDatetimeButton,
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
    IonInput,
    IonDatetime,
  ],
  providers: [DatePipe],
  templateUrl: './add-sub.component.html',
  styleUrls: ['./add-sub.component.scss'],
})
export class AddSubComponent {
  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
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
  subsciptionDeadline: string[] = ['Indéterminée', 'Date de fin'];
  today = formatDate(new Date().toISOString(), 'YYYY-MM-dd', 'fr-CH');
  selectedNextPaymentDate: string | null = this.today;
  selectedDeadlineDate: string | null = this.today;
  isDataValid: boolean = true;
  status: boolean = false;
  indetermineeValue: string = 'Indéterminée';

  addSubscribtionForm!: FormGroup;
  selectedCompany = new FormControl(
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
  selectedDeadline = new FormControl(
    '',
    Validators.compose([Validators.required])
  );
  deadline = new FormControl(
    this.subsciptionDeadline[0],
    Validators.compose([Validators.required])
  );

  constructor(
    private companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router,
    private loadingCtrl: LoadingController
  ) {
    this.addSubscribtionForm = new FormGroup({
      companyName: this.selectedCompany,
      amount: this.amount,
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
      nextPaymentDate: this.nextPaymentDate,
      deadline: this.deadline,
    });
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
    this.selectedCompany.setValue(option.name);
    this.logo = option.logo;
    this.domain = option.domain;
    this.toggleDropdown = false;
  }

  resetForm() {
    this.addSubscribtionForm.reset();
    this.logo = '';
    this.domain = '';
    const formData = this.addSubscribtionForm.value;
    formData.deadline = null;
    this.selectedDeadline
    this.selectedDeadlineDate
    this.deadline
    this.status = false;
  }

  openDateModal($event: any) {
    const value = $event.detail.value;
    this.status = value === 'Date de fin';
    if (value === this.subsciptionDeadline[0]) {
      this.deadline.setValue(this.subsciptionDeadline[0]);
    } else if (value === 'Date de fin') {
      this.deadline.reset();
    }
  }

  async onSubmit() {
    const user: any = localStorage.getItem('user');
    const localStorageData: any = JSON.parse(user);

    if (!localStorageData || !localStorageData.uid) {
      throw new Error('User ID not found in localStorage');
    }
    if (this.selectedDeadline.value === this.subsciptionDeadline[0]) {
      this.addSubscribtionForm.value.deadline = null;
    }

    if (this.addSubscribtionForm.valid) {
      this.isDataValid = true;
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });

      const formData = {
        ...this.addSubscribtionForm.value,
        logo: this.logo,
        domain: this.domain,
        paymentHistory: [],
        userID: localStorageData.uid,
      };

      const db = getFirestore();
      await setDoc(doc(collection(db, 'subscriptions')), formData);

      this.resetForm();
      this._router.navigate(['/home']);
    } else {
      this.isDataValid = false;
    }
  }
}
