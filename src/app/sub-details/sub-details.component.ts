import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { Subscription } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTabButton,
  IonIcon,
  IonContent,
  IonTitle,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
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
  private userToken: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!).uid
    : '';

  constructor(
    private _route: ActivatedRoute,
    private readonly firestore: DataService,
    private readonly _router: Router
  ) {
    addIcons({
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    if (this.userToken) {
      this.subscription$ = this.firestore
        .loadOneSubData(this.subId)
    }
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  trackByFn(index: number, item: any) {
    return index;
  }

  back() {
    this._router.navigate(['/home']);
  }
}
