import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';

import { Platform, NavController } from '@ionic/angular';

import { IdentityService } from '@app/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private identity: IdentityService,
    private navController: NavController,
    private platform: Platform,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    if (this.platform.is('hybrid')) {
      const { SplashScreen } = Plugins;
      SplashScreen.hide();
    }
    this.identity.changed.subscribe(u => {
      const route = u ? ['/'] : ['/', 'login'];
      this.navController.navigateRoot(route);
    });
  }
}
