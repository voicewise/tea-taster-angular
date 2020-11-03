import { TestBed } from '@angular/core/testing';
import { ModalController, Platform } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { IdentityService } from './identity.service';
import {
  createOverlayControllerMock,
  createOverlayElementMock,
  createPlatformMock,
} from '@test/mocks';
import { DefaultSession } from '@ionic-enterprise/identity-vault';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';

describe('IdentityService', () => {
  let service: IdentityService;
  let modal: HTMLIonModalElement;

  beforeEach(() => {
    modal = createOverlayElementMock('modal');
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModalController,
          useFactory: () =>
            createOverlayControllerMock('ModalController', modal),
        },
        { provide: Platform, useFactory: createPlatformMock },
      ],
    });
    service = TestBed.inject(IdentityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('calls the base class login', async () => {
      spyOn(service, 'isBiometricsAvailable').and.returnValue(
        Promise.resolve(true),
      );
      spyOn(service, 'login');
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(
        {
          username: 'test@test.org',
          token: '19940059fkkf039',
        },
        AuthMode.BiometricOnly,
      );
    });

    it('uses passcode if biometrics is not available', async () => {
      spyOn(service, 'isBiometricsAvailable').and.returnValue(
        Promise.resolve(false),
      );
      spyOn(service, 'login');
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(
        {
          username: 'test@test.org',
          token: '19940059fkkf039',
        },
        AuthMode.PasscodeOnly,
      );
    });

    it('uses the set auth mode', async () => {
      service.useAuthMode(AuthMode.InMemoryOnly);
      spyOn(service, 'login');
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(service.login).toHaveBeenCalledWith(
        {
          username: 'test@test.org',
          token: '19940059fkkf039',
        },
        AuthMode.InMemoryOnly,
      );
    });

    it('emits the change', async () => {
      let session: DefaultSession;
      service.changed.subscribe(s => (session = s));
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(session).toEqual({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
    });

    it('calls the logout method', async () => {
      spyOn(service, 'logout');
      await service.clear();
      expect(service.logout).toHaveBeenCalledTimes(1);
    });

    it('emits empty', async () => {
      let session: DefaultSession = {
        username: 'test@test.com',
        token: 'IAmAToken',
      };
      service.changed.subscribe(s => (session = s));
      await service.clear();
      expect(session).toBeUndefined();
    });
  });

  describe('on vault locked', () => {
    it('emits an empty session', () => {
      let session: DefaultSession = {
        username: 'test@test.org',
        token: '19940059fkkf039',
      };
      service.changed.subscribe(s => (session = s));
      service.onVaultLocked(null);
      expect(session).toBeUndefined();
    });
  });

  describe('on session restored', () => {
    it('emits the session', () => {
      let session: DefaultSession;
      service.changed.subscribe(s => (session = s));
      service.onSessionRestored({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
      expect(session).toEqual({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
    });
  });

  describe('onPasscodeRequest', () => {
    beforeEach(() => {
      (modal.onDidDismiss as any).and.returnValue(
        Promise.resolve({ role: 'cancel' }),
      );
    });

    [true, false].forEach(setPasscode => {
      it(`creates a PIN dialog, setting passcode: ${setPasscode}`, async () => {
        const modalController = TestBed.inject(ModalController);
        await service.onPasscodeRequest(setPasscode);
        expect(modalController.create).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledWith({
          backdropDismiss: false,
          component: PinDialogComponent,
          componentProps: {
            setPasscodeMode: setPasscode,
          },
        });
      });
    });

    it('presents the modal', async () => {
      await service.onPasscodeRequest(false);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('resolves to the PIN', async () => {
      (modal.onDidDismiss as any).and.returnValue(
        Promise.resolve({ data: '4203', role: 'OK' }),
      );
      expect(await service.onPasscodeRequest(true)).toEqual('4203');
    });

    it('resolves to an empty string if the PIN is undefined', async () => {
      expect(await service.onPasscodeRequest(true)).toEqual('');
    });
  });
});
