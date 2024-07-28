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
} from '@ionic/angular/standalone';
import { logInOutline, logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

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
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private animationCtrl: AnimationController,
    private modalCtrl: ModalController
  ) {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit() {
    addIcons({ logoGoogle, logInOutline });
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
      this.navCtrl.navigateRoot('/home');
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
        await this.authService.serviceLoginWithemail(
          this.loginForm.value.email,
          this.loginForm.value.password
        );
        this.navCtrl.navigateRoot('/home');
        this.modalCtrl.dismiss();
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        await loading.dismiss();
      }
    }
  }
}
