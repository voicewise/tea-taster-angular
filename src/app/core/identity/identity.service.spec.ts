import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { IdentityService } from './identity.service';
import { createPlatformMock } from '@test/mocks';
import { DefaultSession } from '@ionic-enterprise/identity-vault';

describe('IdentityService', () => {
  let service: IdentityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Platform, useFactory: createPlatformMock }],
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
});
