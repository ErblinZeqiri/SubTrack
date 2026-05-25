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
  IonItem,
  IonText,
  IonAvatar,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  LoadingController,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, cashOutline, pricetagOutline, repeatOutline,
  calendarOutline, hourglassOutline, calendarClearOutline, closeCircle,
  chevronForwardOutline,
} from 'ionicons/icons';
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
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonLabel,
    IonAvatar,
    IonText,
    IonItem,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly quickSuggestions = ['Netflix', 'Spotify', 'Disney+', 'Apple', 'Amazon', 'YouTube', 'Adobe'];

  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  readonly subsciptionDeadline = SUBSCRIPTION_DEADLINE_TYPES;
  today = formatDate(new Date().toISOString(), 'YYYY-MM-dd', 'fr-CH');
  showErrors: boolean = false;
  status: boolean = false;

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
  deadline = new FormControl<string>(
    this.subsciptionDeadline[0],
    Validators.compose([Validators.required])
  );

  get formattedNextPaymentDate(): string {
    const v = this.nextPaymentDate.value;
    if (!v) return 'Choisir une date';
    return formatDate(v, 'd MMM yyyy', 'fr-CH');
  }

  get formattedDeadlineDate(): string {
    const v = this.deadline.value;
    if (!v || v === this.subsciptionDeadline[0]) return 'Choisir une date';
    return formatDate(v, 'd MMM yyyy', 'fr-CH');
  }

  constructor(
    private readonly companySuggestionsService: CompanySuggestionsService,
    private readonly _router: Router,
    private readonly loadingCtrl: LoadingController,
    private readonly _dataService: DataService,
    private readonly _auth: AuthService
  ) {
    addIcons({
      searchOutline, cashOutline, pricetagOutline, repeatOutline,
      calendarOutline, hourglassOutline, calendarClearOutline, closeCircle,
      chevronForwardOutline,
    });
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

  quickSelect(name: string) {
    this.selectedCompany.setValue(name);
    this.filteredOptions$ = this.companySuggestionsService
      .fetchCompanySuggestions(name)
      .pipe(takeUntilDestroyed(this.destroyRef));
    this.toggleDropdown = true;
  }

  clearService() {
    this.selectedCompany.setValue('');
    this.logo = '';
    this.domain = '';
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
    this.addSubscribtionForm.value.deadline = null;
    this.status = false;
    this.showErrors = false;
  }

  openDateModal($event: any) {
    const value = $event.detail.value;
    this.selectedDeadline.setValue(value);
    this.status = value === 'Date de fin';
    if (value === this.subsciptionDeadline[0]) {
      this.deadline.setValue(this.subsciptionDeadline[0]);
    } else if (value === 'Date de fin') {
      this.deadline.setValue(this.today);
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
      this.showErrors = true;
    }
  }
}
