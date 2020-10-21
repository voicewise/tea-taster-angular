import { Component, OnInit } from '@angular/core';
import { AuthenticationService, IdentityService } from '@app/core';
import { AuthMode } from '@ionic-enterprise/identity-vault';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  errorMessage: string;

  displayVaultLogin: boolean;

  constructor(
    private auth: AuthenticationService,
    private identity: IdentityService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.displayVaultLogin = await this.canUnlock();
  }

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

  unlock() {
    this.identity.restoreSession();
  }

  private async canUnlock(): Promise<boolean> {
    if (!(await this.identity.hasStoredSession())) {
      return false;
    }

    const mode = await this.identity.getAuthMode();
    return (
      mode === AuthMode.PasscodeOnly ||
      mode === AuthMode.BiometricAndPasscode ||
      (mode === AuthMode.BiometricOnly &&
        (await this.identity.isBiometricsAvailable()))
    );
  }
}
