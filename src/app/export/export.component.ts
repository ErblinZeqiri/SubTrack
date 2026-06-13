import { Component, ElementRef, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonIcon, IonToggle, IonButton, IonSpinner,
  ToastController, NavController, ModalController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  gridOutline, calendarOutline, timeOutline,
  documentTextOutline, gridSharp, codeSlashOutline,
  downloadOutline, checkmarkCircleOutline, imagesOutline, createOutline,
  chevronBackOutline,
} from 'ionicons/icons';

import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data.service';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { ReportsService } from '../services/reports/reports.service';
import {
  ExportService, ExportScope, ExportFormat, ExportPeriod,
} from '../services/export/export.service';
import { PlanService, FREE_EXPORT_LIMIT } from '../services/plan/plan.service';
import { UpgradeComponent } from '../upgrade/upgrade.component';
import { Subscription } from 'src/interfaces/interface';
import { of, switchMap, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonIcon, IonToggle, IonButton, IonSpinner,
    CommonModule, FormsModule,
  ],
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
})
export class ExportComponent implements OnInit {

  subscriptions: Subscription[] = [];
  loading = true;
  exporting = false;
  exportSuccess = false;

  selectedScope:  ExportScope  = 'monthly';
  selectedFormat: ExportFormat = 'csv';
  selectedPeriod: ExportPeriod = '6months';
  includeLogos = true;
  includeNotes = false;

  // Mois contexte reçu depuis la page rapports
  contextYear  = new Date().getFullYear();
  contextMonth = new Date().getMonth();

  lastExport: { date: string; scope: string; format: string } | null = null;

  private readonly el          = inject(ElementRef);
  private readonly navCtrl     = inject(NavController);
  private readonly router      = inject(Router);
  private readonly auth        = inject(AuthService);
  private readonly dataService = inject(DataService);
  readonly prefs               = inject(UserPreferencesService);
  private readonly reports     = inject(ReportsService);
  private readonly exportSvc   = inject(ExportService);
  private readonly toastCtrl   = inject(ToastController);
  private readonly planService = inject(PlanService);
  private readonly modalCtrl   = inject(ModalController);

  readonly freeExportLimit = FREE_EXPORT_LIMIT;
  exportUsed = 0;

  constructor() {
    addIcons({
      gridOutline, calendarOutline, timeOutline,
      documentTextOutline, gridSharp, codeSlashOutline,
      downloadOutline, checkmarkCircleOutline, imagesOutline, createOutline,
      chevronBackOutline,
    });

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { year?: number; month?: number } | undefined;
    if (state?.year !== undefined) this.contextYear  = state.year;
    if (state?.month !== undefined) this.contextMonth = state.month;
  }

  goBack(): void {
    this.el.nativeElement.classList.add('leaving');
    setTimeout(() => this.navCtrl.back(), 270);
  }

  async ngOnInit(): Promise<void> {
    this.lastExport = await this.exportSvc.getLastExport();
    this.exportUsed = await this.planService.getExportCount();

    this.auth.getCurrentUser().pipe(
      switchMap(user => user ? this.dataService.loadSubData(user.uid) : of([])),
    ).subscribe(subs => {
      this.subscriptions = subs;
      this.loading = false;
    });
  }

  get monthlyLabel(): string {
    return this.reports.formatMonthLabel(this.contextYear, this.contextMonth);
  }

  get monthlyTotal(): number {
    return this.reports.getMonthlyTotal(this.subscriptions, this.contextYear, this.contextMonth);
  }

  get showPeriodPicker(): boolean {
    return this.selectedScope !== 'monthly';
  }

  get exportReady(): boolean {
    return !this.loading && this.subscriptions.length > 0;
  }

  selectScope(scope: ExportScope): void {
    this.selectedScope = scope;
  }

  selectFormat(format: ExportFormat): void {
    this.selectedFormat = format;
  }

  selectPeriod(period: ExportPeriod): void {
    this.selectedPeriod = period;
  }

  async onExport(): Promise<void> {
    if (this.exporting) return;

    const { allowed, used, limit } = await this.planService.canExport();
    if (!allowed) {
      const modal = await this.modalCtrl.create({
        component: UpgradeComponent,
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        cssClass: 'upgrade-modal',
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      if (data?.upgraded) this.exportUsed = await this.planService.getExportCount();
      return;
    }

    this.exporting = true;

    try {
      const savedName = await this.exportSvc.export(this.subscriptions, {
        scope:        this.selectedScope,
        format:       this.selectedFormat,
        period:       this.selectedPeriod,
        year:         this.contextYear,
        month:        this.contextMonth,
        currency:     this.prefs.currency,
        includeLogos: this.includeLogos,
      });

      await this.planService.recordExport();
      this.exportUsed = await this.planService.getExportCount();
      this.exportSuccess = true;
      this.lastExport = await this.exportSvc.getLastExport();
      setTimeout(() => { this.exportSuccess = false; }, 3000);

      const toast = await this.toastCtrl.create({
        message: `Fichier enregistré : ${savedName}`,
        duration: 4000,
        position: 'bottom',
        color: 'dark',
      });
      await toast.present();
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError'
        || err?.message?.toLowerCase().includes('abort')
        || err?.message?.toLowerCase().includes('cancel');
      if (!isAbort) {
        console.error('[Export]', err);
        const toast = await this.toastCtrl.create({
          message: `Erreur : ${err?.message ?? 'inconnue'}`,
          duration: 4000,
          position: 'bottom',
          color: 'warning',
        });
        await toast.present();
      }
    } finally {
      this.exporting = false;
    }
  }
}
