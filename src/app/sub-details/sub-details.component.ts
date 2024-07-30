import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { Subscription } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTabButton,
  IonIcon,
  IonContent,
  IonTitle,
} from '@ionic/angular/standalone';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [
    IonTitle,
    IonContent,
    IonIcon,
    IonTabButton,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
  templateUrl: './sub-details.component.html',
  styleUrls: ['./sub-details.component.css'],
})
export class SubDetailsComponent implements OnInit {
  subscription$!: Observable<Subscription | undefined>;
  private subId: string = this._route.snapshot.params['id'];
  private userToken: string = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).uid : '';

  constructor(
    private _route: ActivatedRoute,
    private readonly firestore: DataService
  ) {
    addIcons({
      arrowBack,
    });
  }

  ngOnInit(): void {
    if (this.userToken) {
      this.subscription$ = this.firestore.loadOneSubData(this.userToken, this.subId).pipe(
        map(sub => {
          if (sub && sub.nextPaymentDate instanceof Timestamp) {
            sub.nextPaymentDate = sub.nextPaymentDate.toDate();
          }
          return sub;
        })
      );
    }
  }
}
