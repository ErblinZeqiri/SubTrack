import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { Subscription } from 'src/interfaces/interface';
import { DataService } from '../services/data/data.service';
import { addIcons } from 'ionicons';
import {
  searchOutline, cashOutline, pricetagOutline, repeatOutline,
  calendarOutline, hourglassOutline, calendarClearOutline, closeCircle,
  chevronForwardOutline, checkmarkCircle,
} from 'ionicons/icons';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
  SUBSCRIPTION_DEADLINE_TYPES,
} from '../constants/subscription.constants';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonTitle,
  IonItem,
  IonInput,
  IonText,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonAvatar,
  IonModal,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonSpinner,
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
import localeFrCh from '@angular/common/locales/fr-CH';
import { AuthService } from '../services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

registerLocaleData(localeFrCh, 'fr-CH');

@Component({
  selector: 'app-update-sub',
  templateUrl: './update-sub.component.html',
  styleUrls: ['./update-sub.component.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonBackButton,
    IonButtons,
    IonButton,
    IonLabel,
    IonAvatar,
    IonText,
    IonItem,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonIcon,
    IonModal,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonInput,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe],
})
export class UpdateSubComponent implements OnInit {
  subscription$!: Observable<Subscription | undefined>;
  subId: string = this._route.snapshot.params['id'];
  logo = '';
  domain = '';
  filteredOptions$!: Observable<Company[]>;
  toggleDropdown = false;
  showErrors = false;
  isSubmitting = false;
  isSuccess = false;
  status = false;

  private readonly destroyRef = inject(DestroyRef);

  readonly quickSuggestions = ['Netflix', 'Spotify', 'Disney+', 'Apple', 'Amazon', 'YouTube', 'Adobe'];
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  readonly subsciptionDeadline = SUBSCRIPTION_DEADLINE_TYPES;

  today = formatDate(new Date().toISOString(), 'YYYY-MM-dd', 'fr-CH');

  updateSubscribtionForm!: FormGroup;
  selectedCompany = new FormControl('', Validators.compose([Validators.required]));
  amount = new FormControl('', Validators.compose([Validators.required]));
  selectedCategory = new FormControl('', Validators.compose([Validators.required]));
  selectedRenewal = new FormControl('', Validators.compose([Validators.required]));
  nextPaymentDate = new FormControl(this.today, Validators.compose([Validators.required]));
  selectedDeadline = new FormControl('', Validators.compose([Validators.required]));
  deadline = new FormControl<string>(this.subsciptionDeadline[0], Validators.compose([Validators.required]));

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
    private _route: ActivatedRoute,
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly companySuggestionsService: CompanySuggestionsService,
    private readonly _auth: AuthService,
  ) {
    addIcons({
      searchOutline, cashOutline, pricetagOutline, repeatOutline,
      calendarOutline, hourglassOutline, calendarClearOutline, closeCircle,
      chevronForwardOutline, checkmarkCircle,
    });
  }

  async ngOnInit() {
    this.updateSubscribtionForm = new FormGroup({
      companyName: this.selectedCompany,
      amount: this.amount,
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
      nextPaymentDate: this.nextPaymentDate,
      selectedDeadline: this.selectedDeadline,
      deadline: this.deadline,
    });

    const currentUser = await firstValueFrom(this._auth.getCurrentUser());
    if (!currentUser?.uid) throw new Error('User ID not found');

    const subscription$ = this._dataService
      .loadOneSubData(this.subId)
      .pipe(takeUntilDestroyed(this.destroyRef));
    this.subscription$ = subscription$;

    subscription$.subscribe((subscription) => {
      if (!subscription) return;

      const hasDeadline = !!subscription.deadline && subscription.deadline !== this.subsciptionDeadline[0];
      this.status = hasDeadline;

      this.updateSubscribtionForm.patchValue({
        companyName: subscription.companyName,
        amount: subscription.amount,
        category: subscription.category,
        renewal: subscription.renewal,
        nextPaymentDate: subscription.nextPaymentDate,
        selectedDeadline: hasDeadline ? 'Date de fin' : this.subsciptionDeadline[0],
        deadline: subscription.deadline ?? this.subsciptionDeadline[0],
      });

      this.logo = subscription.logo || '';
      this.domain = subscription.domain || '';
    });
  }

  onInput(ev: any) {
    const value = ev.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9 ]+/g, '');
    if (filteredValue.length > 1) {
      this.filteredOptions$ = this.companySuggestionsService
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
    setTimeout(() => { this.toggleDropdown = false; }, 200);
  }

  resetForm() {
    this.updateSubscribtionForm.reset();
    this.updateSubscribtionForm.markAsPristine();
    this.updateSubscribtionForm.markAsUntouched();
    this.logo = '';
    this.domain = '';
    this.status = false;
    this.showErrors = false;
    this.isSubmitting = false;
    this.isSuccess = false;
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
    if (this.isSubmitting) return;

    const currentUser = await firstValueFrom(this._auth.getCurrentUser());
    if (!currentUser?.uid) throw new Error('User ID not found');

    if (this.selectedDeadline.value === this.subsciptionDeadline[0]) {
      this.updateSubscribtionForm.value.deadline = null;
    }

    if (this.updateSubscribtionForm.valid) {
      this.showErrors = false;
      this.isSubmitting = true;

      const formData = {
        ...this.updateSubscribtionForm.value,
        logo: this.logo,
        domain: this.domain,
        userID: currentUser.uid,
      };

      await this._dataService.updateSubscription(this.subId, formData);

      this.isSubmitting = false;
      this.isSuccess = true;

      await new Promise(r => setTimeout(r, 700));

      this._router.navigate(['/home']);
    } else {
      this.updateSubscribtionForm.markAllAsTouched();
      this.showErrors = true;
    }
  }
}
