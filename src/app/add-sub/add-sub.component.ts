import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
  SUBSCRIPTION_DEADLINE_TYPES,
} from '../constants/subscription.constants';
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
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  LoadingController,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
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
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import localeFrCh from '@angular/common/locales/fr-CH';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

registerLocaleData(localeFrCh, 'fr-CH');

@Component({
  selector: 'app-add-sub',
  standalone: true,
  imports: [
    IonModal,
    IonDatetimeButton,
    IonCol,
    IonRow,
    IonGrid,
    IonButton,
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
  logo = '';
  domain = '';
  filteredOptions$!: Observable<Company[]>;
  toggleDropdown: boolean = false;
  selectedOption: Company | null = null;
  private readonly destroyRef = inject(DestroyRef);
  
  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  readonly subsciptionDeadline = SUBSCRIPTION_DEADLINE_TYPES;
  today = formatDate(new Date().toISOString(), 'YYYY-MM-dd', 'fr-CH');
  selectedNextPaymentDate: string | null = this.today;
  selectedDeadlineDate: string | null = this.today;
  isDataValid: boolean = true;
  showErrors: boolean = false;
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
    private readonly companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router,
    private readonly loadingCtrl: LoadingController,
    private readonly _dataService: DataService,
    private readonly _auth: AuthService
  ) {
    this.addSubscribtionForm = new FormGroup({
      companyName: this.selectedCompany,
      amount: this.amount,
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
      nextPaymentDate: this.nextPaymentDate,
      selectedDeadline: this.selectedDeadline,
      deadline: this.deadline,
    });
  }

  onInput(ev: any) {
    const value = ev.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]+/g, '');

    if (filteredValue.length > 1) {
      this.filteredOptions$ =
        this.companySuggestionsService
          .fetchCompanySuggestions(filteredValue)
          .pipe(takeUntilDestroyed(this.destroyRef));
      this.toggleDropdown = true;
    }
  }

  selectOption(option: Company) {
    this.selectedCompany.setValue(option.name);
    this.logo = this.companySuggestionsService.getLogoUrl(option);
    this.domain = option.domain;
    this.toggleDropdown = false;
  }

  closeDropdown() {
    // Petit délai pour permettre le clic sur une option avant la fermeture
    setTimeout(() => {
      this.toggleDropdown = false;
    }, 200);
  }

  resetForm() {
    this.addSubscribtionForm.reset();
    this.addSubscribtionForm.markAsPristine();
    this.addSubscribtionForm.markAsUntouched();
    this.logo = '';
    this.domain = '';
    const formData = this.addSubscribtionForm.value;
    formData.deadline = null;
    this.selectedDeadline;
    this.selectedDeadlineDate;
    this.deadline;
    this.status = false;
    this.isDataValid = true;
    this.showErrors = false;
  }

  openDateModal($event: any) {
    const value = $event.detail.value;
    this.selectedDeadline.setValue(value);
    this.status = value === 'Date de fin';
    if (value === this.subsciptionDeadline[0]) {
      this.deadline.setValue(this.subsciptionDeadline[0]);
    } else if (value === 'Date de fin') {
      this.deadline.reset();
    }
  }

  async onSubmit() {
    const currentUser = await firstValueFrom(this._auth.getCurrentUser());
    if (!currentUser || !currentUser.uid) {
      throw new Error('User ID not found');
    }
    if (this.selectedDeadline.value === this.subsciptionDeadline[0]) {
      this.addSubscribtionForm.value.deadline = null;
    }

    if (this.addSubscribtionForm.valid) {
      this.isDataValid = true;
      this.showErrors = false;
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });

      const formData = {
        ...this.addSubscribtionForm.value,
        logo: this.logo,
        domain: this.domain,
        paymentHistory: [],
        userID: currentUser.uid,
      };

      await this._dataService.addSubscription(formData);

      this.resetForm();
      this._router.navigate(['/home']);
    } else {
      this.addSubscribtionForm.markAllAsTouched();
      this.isDataValid = false;
      this.showErrors = true;
    }
  }
}
