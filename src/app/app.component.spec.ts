import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Plugins } from '@capacitor/core';
import { Subject } from 'rxjs';

import { Platform, NavController } from '@ionic/angular';

import { AppComponent } from './app.component';
import { IdentityService } from './core';
import { createIdentityServiceMock } from './core/testing';
import { createPlatformMock, createNavControllerMock } from '@test/mocks';
import { User } from './models';

describe('AppComponent', () => {
  let originalSplashScreen: any;

  beforeEach(
    waitForAsync(() => {
      originalSplashScreen = Plugins.SplashScreen;
      Plugins.SplashScreen = jasmine.createSpyObj('SplashScreen', ['hide']);
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: IdentityService, useFactory: createIdentityServiceMock },
          { provide: NavController, useFactory: createNavControllerMock },
          { provide: Platform, useFactory: createPlatformMock },
        ],
      }).compileComponents();
    }),
  );

  afterEach(() => {
    Plugins.SplashScreen = originalSplashScreen;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('initialization', () => {
    let platform: Platform;
    beforeEach(() => {
      platform = TestBed.inject(Platform);
    });

    describe('in a hybrid mobile context', () => {
      beforeEach(() => {
        (platform.is as any).withArgs('hybrid').and.returnValue(true);
      });

      it('hides the splash screen', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.SplashScreen.hide).toHaveBeenCalledTimes(1);
      });
    });

    describe('in a web context', () => {
      beforeEach(() => {
        (platform.is as any).withArgs('hybrid').and.returnValue(false);
      });

      it('does not hide the splash screen', () => {
        TestBed.createComponent(AppComponent);
        expect(Plugins.SplashScreen.hide).not.toHaveBeenCalled();
      });
    });
  });

  describe('navigation', () => {
    let navController: NavController;
    let platform: Platform;
    beforeEach(async () => {
      navController = TestBed.inject(NavController);
      platform = TestBed.inject(Platform);
      TestBed.createComponent(AppComponent);
      await platform.ready();
    });

    it('does not route if no identity change', () => {
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });

    it('routes to login if no user', () => {
      const identity = TestBed.inject(IdentityService);
      (identity.changed as Subject<User>).next();
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
    });

    it('routes to root if user', () => {
      const identity = TestBed.inject(IdentityService);
      (identity.changed as Subject<User>).next({
        id: 33,
        firstName: 'Fred',
        lastName: 'Rogers',
        email: 'beautiful.day@neighborhood.com',
      });
      expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
      expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
    });
  });
});
