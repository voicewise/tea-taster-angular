import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController } from '@ionic/angular';

import { IdentityService } from '../identity/identity.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private identity: IdentityService,
    private navController: NavController,
  ) {}

  canActivate(): boolean {
    if (this.identity.token) {
      return true;
    }
    this.navController.navigateRoot(['/', 'login']);
    return false;
  }
}
