import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
} from '@ionic-enterprise/identity-vault';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { User } from '@app/models';
import { environment } from '@env/environment';
import { BrowserVaultPlugin } from '../browser-vault/browser-vault.plugin';

@Injectable({
  providedIn: 'root',
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  /* tslint:disable:variable-name */
  private _changed: Subject<DefaultSession>;
  private _user: User;
  /* tslint:enable:variable-name */

  get changed(): Observable<DefaultSession> {
    return this._changed.asObservable();
  }

  get user(): User {
    return this._user;
  }

  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    private http: HttpClient,
    platform: Platform,
  ) {
    super(platform, { authMode: AuthMode.SecureStorage });
    this._changed = new Subject();
  }

  async init(): Promise<void> {
    await this.restoreSession();
    if (this.token) {
      this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(take(1))
        .subscribe(u => (this._user = u));
    }
  }

  async set(user: User, token: string): Promise<void> {
    const session = { username: user.email, token };
    this._user = user;
    await this.login(session);
    this._changed.next(session);
  }

  async clear(): Promise<void> {
    this._user = undefined;
    await this.logout();
    this._changed.next();
  }

  getPlugin(): IonicNativeAuthPlugin {
    if ((this.platform as Platform).is('hybrid')) {
      return super.getPlugin();
    }
    return this.browserVaultPlugin;
  }
}
