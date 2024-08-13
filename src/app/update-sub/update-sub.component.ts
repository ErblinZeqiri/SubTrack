import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { elementAt, map, Observable, tap } from 'rxjs';
import { Subscription } from 'src/interfaces/interface';
import { DataService } from '../services/data/data.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonTitle,
  IonList,
  IonItem,
  IonInput,
  IonText,
  IonLabel,
  IonDatetimeButton,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  LoadingController,
  IonAvatar,
  IonModal,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonButtons,
} from '@ionic/angular/standalone';
import {
  Company,
  CompanySuggestionsService,
} from '../services/companySuggestions/company-suggestions.service';
import {
  formatDate,
  CommonModule,
  DatePipe,
  registerLocaleData,
} from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { collection, doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import localeFrCh from '@angular/common/locales/fr-CH';

registerLocaleData(localeFrCh, 'fr-CH');

@Component({
  selector: 'app-update-sub',
  templateUrl: './update-sub.component.html',
  styleUrls: ['./update-sub.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
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
})
export class UpdateSubComponent implements OnInit {
  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  subscription$!: Observable<Subscription | undefined>;
  subId: string = this._route.snapshot.params['id'];
  userToken: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!).uid
    : '';
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
  isDataValid: boolean = true;

  updateSubscribtionForm!: FormGroup;
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
  constructor(
    private _route: ActivatedRoute,
    private readonly firestore: DataService,
    private readonly _router: Router,
    private companySuggestionsService: CompanySuggestionsService,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      arrowBackOutline,
    });
  }

  ngOnInit() {
    this.updateSubscribtionForm = new FormGroup({
      companyName: this.selectedCompany,
      amount: this.amount,
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
      nextPaymentDate: this.nextPaymentDate,
    });
    if (this.userToken) {
      this.subscription$ = this.firestore.loadOneSubData(this.subId);
      this.subscription$.subscribe((subscription) => {
        if (subscription) {
          this.updateSubscribtionForm.patchValue({
            companyName: subscription.companyName,
            amount: subscription.amount,
            category: subscription.category,
            renewal: subscription.renewal,
            nextPaymentDate: subscription.nextPaymentDate,
          });

          this.logo = subscription.logo || '';
          this.domain = subscription.domain || '';
        }
      });
      console.log(this.updateSubscribtionForm);
    }
  }
  back() {
    this._router.navigate(['/home']);
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
    this.updateSubscribtionForm.reset();
    this.logo = '';
    this.domain = '';
  }

  async onSubmit() {
    const user: any = localStorage.getItem('user');
    const localStorageData: any = JSON.parse(user);

    if (!localStorageData || !localStorageData.uid) {
      throw new Error('User ID not found in localStorage');
    }

    if (this.updateSubscribtionForm.valid) {
      this.isDataValid = true;
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });

      const formData = {
        ...this.updateSubscribtionForm.value,
        logo: this.logo,
        domain: this.domain,
        paymentHistory: [],
        userID: localStorageData.uid,
      };

      const db = getFirestore();
      const docRef = doc(db, `subscriptions/${this.subId}`);
      await updateDoc(docRef, formData);

      this.resetForm();
      this._router.navigate(['/home']);
    } else {
      this.isDataValid = false;
    }
  }
}
