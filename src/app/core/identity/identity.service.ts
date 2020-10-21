import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import {
  AuthMode,
  DefaultSession,
  IonicIdentityVaultUser,
  IonicNativeAuthPlugin,
  LockEvent,
  VaultErrorCodes,
} from '@ionic-enterprise/identity-vault';
import { Subject, Observable } from 'rxjs';

import { User } from '@app/models';
import { BrowserVaultPlugin } from '../browser-vault/browser-vault.plugin';

@Injectable({
  providedIn: 'root',
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {
  /* tslint:disable:variable-name */
  private _changed: Subject<DefaultSession>;
  /* tslint:enable:variable-name */

  get changed(): Observable<DefaultSession> {
    return this._changed.asObservable();
  }

  constructor(
    private browserVaultPlugin: BrowserVaultPlugin,
    platform: Platform,
  ) {
    super(platform, {
      authMode: AuthMode.SecureStorage,
      unlockOnAccess: true,
      hideScreenOnBackground: true,
      lockAfter: 5000,
    });
    this._changed = new Subject();
  }

  async set(user: User, token: string): Promise<void> {
    const mode = (await this.isBiometricsAvailable())
      ? AuthMode.BiometricOnly
      : AuthMode.PasscodeOnly;
    const session = { username: user.email, token };
    await this.login(session, mode);
    this._changed.next(session);
  }

  async clear(): Promise<void> {
    await this.logout();
    this._changed.next();
  }

  onVaultLocked(evt: LockEvent) {
    this._changed.next();
  }

  onSessionRestored(session: DefaultSession) {
    this._changed.next(session);
  }

  async restoreSession(): Promise<DefaultSession> {
    try {
      return await super.restoreSession();
    } catch (error) {
      if (error.code === VaultErrorCodes.VaultLocked) {
        const vault = await this.getVault();
        await vault.clear();
      } else {
        throw error;
      }
    }
  }

  getPlugin(): IonicNativeAuthPlugin {
    if ((this.platform as Platform).is('hybrid')) {
      return super.getPlugin();
    }
    return this.browserVaultPlugin;
  }
}
