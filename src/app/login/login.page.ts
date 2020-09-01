import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string;
  password: string;
  errorMessage: string;

  constructor(private auth: AuthenticationService) {}

  signIn() {
    this.auth
      .login(this.email, this.password)
      .pipe(take(1))
      .subscribe(success => {
        if (!success) {
          this.errorMessage = 'Invalid e-mail address or password';
        }
      });
  }
}
