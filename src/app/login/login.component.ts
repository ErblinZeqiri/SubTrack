import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import {
  LoadingController,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonImg,
  IonInput,
  IonText,
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
    IonList,
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
    this.resetForm();
  }

  private resetForm() {
    this.loginForm.reset();
    this.email.reset();
    this.password.reset();
    this.isDataValid = true;
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
      this.resetForm();
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
        this.resetForm();
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
