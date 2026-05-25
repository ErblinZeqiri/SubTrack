import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import {
  LoadingController,
  AlertController,
  ToastController,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonImg,
  IonInput,
  IonText,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonText,
    IonInput,
    IonImg,
    IonItem,
    IonIcon,
    IonButton,
    IonContent,
    ReactiveFormsModule,
    IonInputPasswordToggle,
  ],
})
export class LoginComponent implements OnInit {
  email = new FormControl(
    '',
    Validators.compose([Validators.required, Validators.email])
  );
  password = new FormControl(
    '',
    Validators.compose([Validators.required, Validators.minLength(6)])
  );

  loginForm: FormGroup;
  isDataValid: boolean = true;

  constructor(
    private readonly authService: AuthService,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly toastCtrl: ToastController,
    private readonly router: Router
  ) {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
    this.resetForm();
  }

  private resetForm() {
    this.loginForm.reset();
    this.isDataValid = true;
  }

  async loginWithEmail() {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) {
      this.isDataValid = false;
      return;
    }

    this.isDataValid = true;
    const loading = await this.loadingCtrl.create({ message: 'Connexion...' });
    await loading.present();

    try {
      await this.authService.serviceLoginWithemail(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      this.resetForm();
    } catch (error) {
      this.isDataValid = false;
    } finally {
      await loading.dismiss();
    }
  }

  async loginWithGoogle() {
    const loading = await this.loadingCtrl.create({ message: 'Connexion...' });
    await loading.present();

    try {
      await this.authService.serviceLoginWithGoogle();
      this.resetForm();
    } catch (error: any) {
      await this.showErrorToast(error?.message ?? 'Erreur de connexion Google');
    } finally {
      await loading.dismiss();
    }
  }

  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Mot de passe oublié',
      message: 'Entrez votre adresse email pour recevoir un lien de réinitialisation.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'exemple@exemple.com',
          value: this.email.value ?? '',
        },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Envoyer',
          handler: async (data) => {
            if (!data.email) return false;
            try {
              await this.authService.sendPasswordReset(data.email);
              const toast = await this.toastCtrl.create({
                message: 'Email de réinitialisation envoyé.',
                duration: 3000,
                position: 'bottom',
                color: 'dark',
              });
              await toast.present();
            } catch {
              await this.showErrorToast('Adresse email introuvable.');
            }
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  toSigninForm() {
    this.router.navigate(['/signin']);
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
