import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth/auth.service';
import { Subscription } from 'src/interfaces/interface';
import { map, Observable, tap } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonContent, IonTitle, IonToolbar, IonHeader, CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  // sevenDaysInMillis:  = 7 * 24 * 60 * 60 * 1000;
  userSubData$!: Observable<Subscription[]>;

  constructor(
    private readonly _authService: AuthService,
    private readonly firestore: DataService
  ) {}
  
  ngOnInit() {
    this.loadUserSubscriptions();
  }

  private loadUserSubscriptions() {
    const user: any = localStorage.getItem('user');
    const localStorageData: any = JSON.parse(user);
    const userID = localStorageData.uid;
    this.userSubData$ = this.firestore.loadSubData(userID);
    this.userSubData$.pipe(
      tap((subscriptions: any) => {
        console.log('Abonnements utilisateur:', subscriptions);
      })
    );
  }
}
