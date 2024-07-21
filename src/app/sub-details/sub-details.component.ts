import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, User } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './sub-details.component.html',
  styleUrl: './sub-details.component.css',
})
export class SubDetailsComponent implements OnInit {
  user?: User;
  subId: string = this._route.snapshot.params['id'];
  subscriptions?: Subscription[];
  userSubData$!: Observable<Subscription[]> ;

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
    this.userSubData$ =  this.firestore.loadSubData(
      this.subId
    );
  }

  trackByPaymentDate(index: number, payment: any): string {
    return payment.date;
  }
}
