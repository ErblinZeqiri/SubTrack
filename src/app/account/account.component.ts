import { Component, OnInit, inject } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  AlertController,
  ToastController,
  ModalController,
  ActionSheetController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonToggle,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Observable, map, BehaviorSubject, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data/data.service';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { CurrencyPickerComponent } from '../currency-picker/currency-picker.component';
import { SmartAmountPipe } from '../pipes/smart-amount.pipe';
import { User } from '@angular/fire/auth';
import { Subscription } from '../../interfaces/interface';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, calendarOutline, logOutOutline,
  trashOutline, cardOutline, statsChartOutline, chevronForwardOutline,
  notificationsOutline, cashOutline, languageOutline, moonOutline,
  downloadOutline, createOutline, timeOutline, checkmarkOutline,
  imagesOutline, cameraOutline, closeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonIcon, IonToggle, IonSpinner, IonContent, IonTitle, IonToolbar, IonHeader,
    CommonModule, FormsModule, SmartAmountPipe,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userData$!: Observable<User | null>;
  subCount$!: Observable<number>;
  lastSub$!: Observable<Subscription | null>;
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;

  darkMode = true;
  uploadingPhoto = false;

  // Sujet pour forcer le rafraîchissement de l'avatar après upload
  private readonly refreshUser$ = new BehaviorSubject<void>(undefined);

  private readonly authService        = inject(AuthService);
  private readonly loadingCtrl        = inject(LoadingController);
  private readonly alertCtrl          = inject(AlertController);
  private readonly toastCtrl          = inject(ToastController);
  private readonly modalCtrl          = inject(ModalController);
  private readonly actionSheetCtrl    = inject(ActionSheetController);
  private readonly dataService        = inject(DataService);
  private readonly expensesService    = inject(ExepensesService);
  readonly prefs                      = inject(UserPreferencesService);

  constructor() {
    // Chaque fois que refreshUser$ émet, on relit l'utilisateur courant
    this.userData$ = this.refreshUser$.pipe(
      switchMap(() => this.authService.getCurrentUser()),
    );
    addIcons({
      personOutline, mailOutline, calendarOutline, logOutOutline,
      trashOutline, cardOutline, statsChartOutline, chevronForwardOutline,
      notificationsOutline, cashOutline, languageOutline, moonOutline,
      downloadOutline, createOutline, timeOutline, checkmarkOutline,
      imagesOutline, cameraOutline, closeOutline,
    });
  }

  ngOnInit(): void {
    const subs$ = this.dataService.userSubData$;
    this.subCount$        = subs$.pipe(map((s) => s.length));
    this.monthlyExpenses$ = this.expensesService.getCurrentExpensesMonth(subs$);
    this.yearlyExpenses$  = this.expensesService.getCurrentExpensesYear(subs$);
    this.lastSub$         = subs$.pipe(map((s) => s.length > 0 ? s[s.length - 1] : null));
  }

  async changeProfilePhoto(): Promise<void> {
    // Étape 1 : action sheet custom pour choisir la source
    const sheet = await this.actionSheetCtrl.create({
      header: 'Photo de profil',
      cssClass: 'currency-sheet',
      buttons: [
        {
          text: 'Choisir depuis la galerie',
          icon: 'images-outline',
          handler: () => this.capturePhoto(CameraSource.Photos),
        },
        {
          text: 'Prendre une photo',
          icon: 'camera-outline',
          handler: () => this.capturePhoto(CameraSource.Camera),
        },
        { text: 'Annuler', role: 'cancel', icon: 'close-outline' },
      ],
    });
    await sheet.present();
  }

  private async capturePhoto(source: CameraSource): Promise<void> {
    if (source === CameraSource.Photos) {
      // Galerie : input file natif → se ferme en tapant en dehors, pas besoin de permissions
      this.openFilePicker();
    } else {
      // Caméra : Capacitor gère les permissions et l'accès caméra
      await this.captureFromCamera();
    }
  }

  private openFilePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      const dataUrl = await this.fileToDataUrl(file);
      await this.doUpload(dataUrl);
    };

    input.oncancel = () => document.body.removeChild(input);
    input.click();
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async captureFromCamera(): Promise<void> {
    try {
      // Demande explicite des permissions caméra avant d'ouvrir la caméra
      const permStatus = await Camera.requestPermissions({ permissions: ['camera'] });

      if (permStatus.camera === 'denied') {
        const toast = await this.toastCtrl.create({
          message: 'Autorisation caméra refusée. Activez-la dans Paramètres → Applications → SubTrack.',
          duration: 4000,
          position: 'bottom',
          color: 'warning',
        });
        await toast.present();
        return;
      }

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 85,
        width: 400,
        height: 400,
        correctOrientation: true,
      });
      if (!photo.dataUrl) return;
      await this.doUpload(photo.dataUrl);
    } catch (e: any) {
      const cancelled = ['User cancelled', 'No image picked', 'cancelled'];
      if (!cancelled.some(msg => e?.message?.toLowerCase().includes(msg.toLowerCase()))) {
        await this.showUploadError(e);
      }
    }
  }

  private async doUpload(dataUrl: string): Promise<void> {
    this.uploadingPhoto = true;
    try {
      await this.authService.uploadProfilePhoto(dataUrl);
      this.refreshUser$.next();
      const toast = await this.toastCtrl.create({
        message: 'Photo de profil mise à jour ✓',
        duration: 2000,
        position: 'bottom',
        color: 'dark',
      });
      await toast.present();
    } catch (e: any) {
      await this.showUploadError(e);
    } finally {
      this.uploadingPhoto = false;
    }
  }

  private async showUploadError(e: any): Promise<void> {
    const msg = e?.code === 'storage/unauthorized'
      ? 'Accès Storage refusé — vérifiez les règles Firebase'
      : e?.message ?? "Erreur lors de l'upload";
    console.error('Upload photo:', e);
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 4000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  async openCurrencyPicker(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CurrencyPickerComponent,
      componentProps: { selectedCurrency: this.prefs.currency },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
      cssClass: 'currency-picker-modal',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      await this.prefs.setCurrency(data);
    }
  }

  getInitials(displayName: string | null | undefined): string {
    if (!displayName) return '?';
    return displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getCreationDate(user: User): string {
    const date = user.metadata?.creationTime;
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-CH', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Se déconnecter ?',
      message: 'Vous devrez vous reconnecter pour accéder à vos données.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Déconnexion', role: 'confirm', handler: () => this.logout() },
      ],
    });
    await alert.present();
  }

  async showComingSoon(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: '🚧 Fonctionnalité à venir',
      duration: 1800,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le compte',
      message: 'Cette action est irréversible. Tous vos abonnements et données seront définitivement supprimés.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer définitivement',
          role: 'destructive',
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private async deleteAccount(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Suppression du compte...' });
    await loading.present();
    try { await this.authService.deleteAccount(); }
    catch (e) { console.error(e); }
    finally { await loading.dismiss(); }
  }

  private async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Déconnexion...' });
    await loading.present();
    try { await this.authService.logout(); }
    catch (e) { console.error(e); }
    finally { await loading.dismiss(); }
  }
}
