import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonButtons,
  IonList,
  IonItem,
  IonAvatar,
  IonImg,
  IonLabel,
  IonInput,
  IonText,
  IonGrid,
  IonCol,
  IonRow,
  AnimationController,
  ModalController,
  IonInputPasswordToggle,
} from '@ionic/angular/standalone';
import { logInOutline, logoGoogle, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonRow,
    IonCol,
    IonGrid,
    IonText,
    IonInput,
    IonLabel,
    IonImg,
    IonAvatar,
    IonItem,
    IonList,
    IonButtons,
    IonModal,
    IonIcon,
    IonButton,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
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
  errorMessage: string = '';

  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController,
    private animationCtrl: AnimationController,
    private modalCtrl: ModalController,
    private readonly _router: Router
  ) {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit() {
    addIcons({ logoGoogle, logInOutline, personAddOutline });
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  async loginWithGoogle() {
    const loading = await this.loadingCtrl.create({
      message: 'Connexion...',
    });

    await loading.present();

    try {
      await this.authService.serviceLoginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      await loading.dismiss();
    }
  }

  async loginWithEmail() {
    if (!this.loginForm.valid) {
      this.isDataValid = false;
    } else {
      this.isDataValid = true;
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });

      await loading.present();

      try {
        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;

        this.authService.serviceLoginWithemail(email, password).subscribe({
          next: (data) => {
            if (data.token) {
              console.log('Login successful');
              this._router.navigate(['/home']);
            }
          },
          error: (err) => {
            console.error('Login failed:', err);
          },
        });
        this.modalCtrl.dismiss();
      } catch (error) {
        console.error('Login failed:', error);
        this.isDataValid = false;
      } finally {
        await loading.dismiss();
      }
    }
  }

  toSigninForm() {
    this._router.navigate(['/signin']);
  }
}
