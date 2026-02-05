import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonAlert,
  IonText,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data/data.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonText,
    IonAlert,
    IonButton,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userData$: Observable<User | null>;
  @ViewChild(IonAlert) alertRef?: IonAlert;

  private readonly authService = inject(AuthService);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly dataService = inject(DataService);

  public alertButtons = [
    {
      text: 'Non',
      role: 'cancel',
    },
    {
      text: 'Oui',
      role: 'confirm',
      handler: () => {
        this.alertRef?.dismiss();
        this.logout();
        return false;
      },
    },
  ];

  constructor() {
    // Initialiser userData$ avec getCurrentUser()
    this.userData$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    console.log('✅ AccountComponent initialized');
  }

  private async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Déconnexion...',
    });

    await loading.present();

    try {
      await this.authService.logout();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    } finally {
      await loading.dismiss();
    }
  }
}
