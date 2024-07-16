import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class LoginComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit() {}

  async signin() {
    this.authService.login();
  }
}
