import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { HomePage } from './home/home.page';
import { NotificationService } from './services/notificationsService/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, HomePage],
})
export class AppComponent {
  constructor(private notificationService: NotificationService) {}
}
