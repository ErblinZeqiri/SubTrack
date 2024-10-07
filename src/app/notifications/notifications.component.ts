import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth/auth.service';
import { Subscription } from 'src/interfaces/interface';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
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
  userSubData$!: Observable<Subscription[]>;

  constructor(
    private readonly _auth: AuthService,
    private readonly _dataService: DataService
  ) {}

  ngOnInit() {
    this.loadUserSubscriptions();
  }

  private loadUserSubscriptions() {
    this.userSubData$ = this._auth.getCurrentUser().pipe(
      switchMap((user) => {
        return user
          ? (this._dataService.loadSubData(),
            this._dataService.userSubData$)
          : of([]);
      })
    );
  }
}
