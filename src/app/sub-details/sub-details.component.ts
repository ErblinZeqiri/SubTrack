import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { Subscription } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonIcon,
  IonContent,
  IonTitle,
  IonButton,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [
    IonButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
  templateUrl: './sub-details.component.html',
  styleUrls: ['./sub-details.component.css'],
})
export class SubDetailsComponent implements OnInit {
  subscription$!: Observable<Subscription | undefined>;
  userSubData$!: Observable<Subscription[]>;
  private subId: string = this._route.snapshot.params['id'];
  constructor(
    private _route: ActivatedRoute,
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService
  ) {
    addIcons({
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    if (this.subId) {
      this.subscription$ = this._dataService.loadOneSubData(this.subId);
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
