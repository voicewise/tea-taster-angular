import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Platform } from '@ionic/angular';

import { IdentityService } from './identity.service';
import { environment } from '@env/environment';
import { User } from '@app/models';
import { createPlatformMock } from '@test/mocks';
import { DefaultSession } from '@ionic-enterprise/identity-vault';

describe('IdentityService', () => {
  let service: IdentityService;
  let httpTestController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Platform, useFactory: createPlatformMock }],
    });
    service = TestBed.inject(IdentityService);
    httpTestController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('restores the session', async () => {
      spyOn(service, 'restoreSession');
      await service.init();
      expect(service.restoreSession).toHaveBeenCalledTimes(1);
    });

    describe('if there is a token', () => {
      beforeEach(() => {
        spyOn(service, 'restoreSession').and.callFake(async () => {
          (service as any).session = {
            username: 'meh',
            token: '3884915llf950',
          };
          return (service as any).session;
        });
      });

      it('assigns the token', async () => {
        await service.init();
        expect(service.token).toEqual('3884915llf950');
      });

      it('gets the current user', async () => {
        await service.init();
        const req = httpTestController.expectOne(
          `${environment.dataService}/users/current`,
        );
        expect(req.request.method).toEqual('GET');
        httpTestController.verify();
      });

      it('assigns the user', async () => {
        await service.init();
        const req = httpTestController.expectOne(
          `${environment.dataService}/users/current`,
        );
        req.flush({
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        });
        expect(service.user).toEqual({
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        });
      });
    });

    describe('if there is not a token', () => {
      beforeEach(() => {
        spyOn(service, 'restoreSession').and.callFake(() => {
          (service as any).session = undefined;
          return undefined;
        });
      });

      it('does not assign a token', async () => {
        await service.init();
        expect(service.token).toBeUndefined();
      });

      it('does not get the current user', async () => {
        await service.init();
        httpTestController.verify();
        expect(service.token).toBeUndefined();
        expect(service.user).toBeUndefined();
      });
    });
  });

  describe('set', () => {
    it('sets the user', () => {
      service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(service.user).toEqual({
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.org',
      });
    });

    it('calls the base class login', async () => {
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
      expect(service.login).toHaveBeenCalledWith({
        username: 'test@test.org',
        token: '19940059fkkf039',
      });
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

    it('clears the user', () => {
      service.clear();
      expect(service.user).toBeUndefined();
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
});
