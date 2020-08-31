import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Plugins } from '@capacitor/core';

import { IdentityService } from './identity.service';
import { environment } from '@env/environment';
import { User } from '@app/models';

describe('IdentityService', () => {
  let service: IdentityService;
  let httpTestController: HttpTestingController;
  let originalStorage: any;

  beforeEach(() => {
    originalStorage = Plugins.Storage;
    Plugins.Storage = jasmine.createSpyObj('Storage', {
      get: Promise.resolve(),
      set: Promise.resolve(),
      remove: Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(IdentityService);
    httpTestController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    Plugins.Storage = originalStorage;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('gets the stored token', async () => {
      await service.init();
      expect(Plugins.Storage.get).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.get).toHaveBeenCalledWith({ key: 'auth-token' });
    });

    describe('if there is a token', () => {
      beforeEach(() => {
        (Plugins.Storage.get as any).and.returnValue(
          Promise.resolve({
            value: '3884915llf950',
          }),
        );
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

    it('sets the token', () => {
      service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(service.token).toEqual('19940059fkkf039');
    });

    it('saves the token in storage', async () => {
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(Plugins.Storage.set).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.set).toHaveBeenCalledWith({
        key: 'auth-token',
        value: '19940059fkkf039',
      });
    });

    it('emits the change', async () => {
      let user: User;
      service.changed.subscribe(u => (user = u));
      await service.set(
        {
          id: 42,
          firstName: 'Joe',
          lastName: 'Tester',
          email: 'test@test.org',
        },
        '19940059fkkf039',
      );
      expect(user).toEqual({
        id: 42,
        firstName: 'Joe',
        lastName: 'Tester',
        email: 'test@test.org',
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

    it('clears the token', () => {
      service.clear();
      expect(service.token).toBeUndefined();
    });

    it('clears the storage', async () => {
      await service.clear();
      expect(Plugins.Storage.remove).toHaveBeenCalledTimes(1);
      expect(Plugins.Storage.remove).toHaveBeenCalledWith({
        key: 'auth-token',
      });
    });

    it('emits empty', async () => {
      let user: User = { ...service.user };
      service.changed.subscribe(u => (user = u));
      await service.clear();
      expect(user).toBeUndefined();
    });
  });
});
