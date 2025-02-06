import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonImg,
  IonText,
  IonButton,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
  imports: [IonCol, IonRow, IonButton, IonText, IonImg, IonContent],
  standalone: true,
})
export class Page404Component implements OnInit {
  constructor(private readonly _router: Router) {}

  ngOnInit() {}

  goHome() {
    this._router.navigate(['home']);
  }
}
