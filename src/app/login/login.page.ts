import { Component, NgZone, OnInit } from '@angular/core';
import { AuthenticationService, IdentityService } from '@app/core';
import { Platform } from '@ionic/angular';
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
  displayLockingOptions: boolean;

  authMode: AuthMode;
  authModes: Array<{ mode: AuthMode; label: string }> = [
    {
      mode: AuthMode.PasscodeOnly,
      label: 'Session PIN Unlock',
    },
    {
      mode: AuthMode.SecureStorage,
      label: 'Never Lock Session',
    },
    {
      mode: AuthMode.InMemoryOnly,
      label: 'Force Login',
    },
  ];

  constructor(
    private auth: AuthenticationService,
    private identity: IdentityService,
    private platform: Platform,
    private zone: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.platform.is('hybrid')) {
      this.displayVaultLogin = await this.canUnlock();
      if (await this.identity.isBiometricsAvailable()) {
        this.authModes = [
          { mode: AuthMode.BiometricOnly, label: 'Biometric Unlock' },
          ...this.authModes,
        ];
      }
      this.authMode = this.authModes[0].mode;
      this.displayLockingOptions = true;
    } else {
      this.displayLockingOptions = false;
      this.authMode = AuthMode.SecureStorage;
    }
  }

  signInClicked() {
    if (this.displayVaultLogin) {
      this.switchToSignIn();
    } else {
      this.signIn();
    }
  }

  private switchToSignIn() {
    this.zone.run(async () => {
      const vault = await this.identity.getVault();
      vault.clear();
      this.displayVaultLogin = false;
    });
  }

  private signIn() {
    this.identity.useAuthMode(this.authMode);
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
