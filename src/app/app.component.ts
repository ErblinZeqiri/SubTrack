import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { HomePage } from './home/home.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, HomePage],
})
export class AppComponent {
  constructor() {}
}
