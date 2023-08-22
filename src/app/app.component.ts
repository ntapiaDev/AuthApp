import { Component } from '@angular/core';
import { AuthService } from './shared/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  userId: number;
  constructor(public authService: AuthService) {
    this.userId = authService.getCurrentId();
  }
  logout() {
    this.authService.doLogout();
  }
}
