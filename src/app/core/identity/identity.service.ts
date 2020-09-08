import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Plugins } from '@capacitor/core';

import { User } from '@app/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private key = 'auth-token';
  /* tslint:disable:variable-name */
  private _changed: Subject<User>;
  private _token: string;
  private _user: User;
  /* tslint:enable:variable-name */

  get changed(): Observable<User> {
    return this._changed.asObservable();
  }

  get token(): string {
    return this._token;
  }

  get user(): User {
    return this._user;
  }

  constructor(private http: HttpClient) {
    this._changed = new Subject();
  }

  async init(): Promise<void> {
    const { Storage } = Plugins;
    const res = await Storage.get({ key: this.key });
    this._token = res && res.value;
    if (this._token) {
      this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(take(1))
        .subscribe(u => (this._user = u));
    }
  }

  async set(user: User, token: string): Promise<void> {
    this._user = user;
    this._token = token;
    const { Storage } = Plugins;
    await Storage.set({ key: this.key, value: token });
    this._changed.next(user);
  }

  async clear(): Promise<void> {
    this._user = undefined;
    this._token = undefined;
    const { Storage } = Plugins;
    await Storage.remove({ key: this.key });
    this._changed.next();
  }
}
