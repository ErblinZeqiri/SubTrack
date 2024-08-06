import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  LoadingController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonText,
  IonInputPasswordToggle,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  standalone: true,
  styleUrls: ['./signin.component.scss'],
  imports: [
    IonButton,
    IonText,
    IonInput,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInputPasswordToggle,
    ReactiveFormsModule,
  ],
})
export class SigninComponent implements OnInit {
  fullName = new FormControl(
    '',
    Validators.compose([
      Validators.required,
      Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/),
    ])
  );
  email = new FormControl(
    '',
    Validators.compose([Validators.required, Validators.email])
  );
  password = new FormControl(
    '',
    Validators.compose([Validators.required, Validators.minLength(6)])
  );

  signinFrom: FormGroup;
  isDataValid: boolean = true;

  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController,
    private readonly _router: Router
  ) {
    this.signinFrom = new FormGroup({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
    });
  }

  ngOnInit() {
    addIcons({ arrowBackOutline });
  }

  back() {
    this._router.navigate(['/login']);
  }

  async signin() {
    if (!this.signinFrom.valid) {
      this.isDataValid = false;
    } else {
      this.isDataValid = true;
      const loading = await this.loadingCtrl.create({
        message: 'Connexion...',
      });

      await loading.present();

      this.authService.serviceSigninWithEmail(
        this.signinFrom.value.email,
        this.signinFrom.value.password,
        this.signinFrom.value.fullName
      );

      await loading.dismiss();
    }
  }
}
