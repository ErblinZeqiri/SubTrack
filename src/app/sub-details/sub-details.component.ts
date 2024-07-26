import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, User } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import {
  IonHeader,
  IonToolbar,
  IonTabButton,
  IonIcon,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonTabButton,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
  templateUrl: './sub-details.component.html',
  styleUrl: './sub-details.component.css',
})
export class SubDetailsComponent implements OnInit {
  user?: User;
  subId: string = this._route.snapshot.params['id'];
  subscriptions?: Subscription[];
  userSubData$!: Observable<Subscription[]>;

  constructor(
    private readonly route: ActivatedRoute,
    private _route: ActivatedRoute,
    private readonly firestore: DataService
  ) {
    addIcons({
      arrowBack,
    });
  }

  ngOnInit(): void {
    this.userSubData$ = this.firestore.loadSubData(this.subId);
  }

  trackByPaymentDate(index: number, payment: any): string {
    return payment.date;
  }
}
