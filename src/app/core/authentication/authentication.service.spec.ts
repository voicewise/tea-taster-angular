import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';

import { AuthenticationService } from './authentication.service';
import { IdentityService } from '../identity/identity.service';
import { createIdentityServiceMock } from '../identity/identity.service.mock';
import { environment } from '@env/environment';

describe('AuthenticationService', () => {
  let httpTestingController: HttpTestingController;
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: IdentityService, useFactory: createIdentityServiceMock },
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('POSTs the login', () => {
      service.login('thank.you@forthefish.com', 'solongDude').subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/login`,
      );
      expect(req.request.method).toEqual('POST');
      req.flush({});
      httpTestingController.verify();
    });

    it('passes the credentials in the body', () => {
      service.login('thank.you@forthefish.com', 'solongDude').subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/login`,
      );
      expect(req.request.body).toEqual({
        username: 'thank.you@forthefish.com',
        password: 'solongDude',
      });
      req.flush({});
      httpTestingController.verify();
    });

    describe('on success', () => {
      let response: any;
      beforeEach(() => {
        response = {
          success: true,
          token: '48499501093kf00399sg',
          user: {
            id: 42,
            firstName: 'Douglas',
            lastName: 'Adams',
            email: 'thank.you@forthefish.com',
          },
        };
      });

      it('emits true', fakeAsync(() => {
        service
          .login('thank.you@forthefish.com', 'solongDude')
          .subscribe(r => expect(r).toEqual(true));
        const req = httpTestingController.expectOne(
          `${environment.dataService}/login`,
        );
        req.flush(response);
        tick();
        httpTestingController.verify();
      }));

      it('sets the identity', () => {
        const identity = TestBed.inject(IdentityService);
        service.login('thank.you@forthefish.com', 'solongDude').subscribe();
        const req = httpTestingController.expectOne(
          `${environment.dataService}/login`,
        );
        req.flush(response);
        httpTestingController.verify();
        expect(identity.set).toHaveBeenCalledTimes(1);
        expect(identity.set).toHaveBeenCalledWith(
          {
            id: 42,
            firstName: 'Douglas',
            lastName: 'Adams',
            email: 'thank.you@forthefish.com',
          },
          '48499501093kf00399sg',
        );
      });

      describe('on failure', () => {
        beforeEach(() => {
          response = { success: false };
        });

        it('emits false', fakeAsync(() => {
          service
            .login('thank.you@forthefish.com', 'solongDude')
            .subscribe(r => expect(r).toEqual(false));
          const req = httpTestingController.expectOne(
            `${environment.dataService}/login`,
          );
          req.flush(response);
          tick();
          httpTestingController.verify();
        }));

        it('does not set the identity', () => {
          const identity = TestBed.inject(IdentityService);
          service.login('thank.you@forthefish.com', 'solongDude').subscribe();
          const req = httpTestingController.expectOne(
            `${environment.dataService}/login`,
          );
          req.flush(response);
          httpTestingController.verify();
          expect(identity.set).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('logout', () => {
    it('POSTs the logout', () => {
      service.logout().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/logout`,
      );
      req.flush({});
      httpTestingController.verify();
      expect(true).toBe(true);
    });

    it('clears the identity', fakeAsync(() => {
      const identity = TestBed.inject(IdentityService);
      service.logout().subscribe();
      const req = httpTestingController.expectOne(
        `${environment.dataService}/logout`,
      );
      req.flush({});
      tick();
      expect(identity.clear).toHaveBeenCalledTimes(1);
    }));
  });
});
