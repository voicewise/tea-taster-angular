import { TestBed } from '@angular/core/testing';
import { NavController } from '@ionic/angular';

import { AuthGuardService } from './auth-guard.service';
import { IdentityService } from '../identity/identity.service';

import { createIdentityServiceMock } from '../identity/identity.service.mock';
import { createNavControllerMock } from '@test/mocks';

describe('AuthGuardService', () => {
  let service: AuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: IdentityService, useFactory: createIdentityServiceMock },
        { provide: NavController, useFactory: createNavControllerMock },
      ],
    });
    service = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const identity = TestBed.inject(IdentityService);
      (identity as any).token = '294905993';
    });

    it('does not navigate', async () => {
      const navController = TestBed.inject(NavController);
      await service.canActivate();
      expect(navController.navigateRoot).not.toHaveBeenCalled();
    });

    it('returns true', async () => {
      expect(await service.canActivate()).toEqual(true);
    });
  });

  describe('when not logged in', () => {
    it('attempts to restore the session', async () => {
      const identity = TestBed.inject(IdentityService);
      await service.canActivate();
      expect(identity.restoreSession).toHaveBeenCalledTimes(1);
    });

    describe('if a session is restored', () => {
      beforeEach(() => {
        const identity = TestBed.inject(IdentityService);
        (identity.restoreSession as any).and.callFake(() => {
          (identity as any).token = '294905993';
        });
      });

      it('does not navigate', async () => {
        const navController = TestBed.inject(NavController);
        await service.canActivate();
        expect(navController.navigateRoot).not.toHaveBeenCalled();
      });

      it('returns true', async () => {
        expect(await service.canActivate()).toEqual(true);
      });
    });

    describe('if a session is not restored', () => {
      it('navigates to the login page', async () => {
        const navController = TestBed.inject(NavController);
        await service.canActivate();
        expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
        expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
      });

      it('returns false', async () => {
        expect(await service.canActivate()).toEqual(false);
      });
    });
  });
});
