import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit() {}

  logout() {
    this.authService.logout();
  }
}
