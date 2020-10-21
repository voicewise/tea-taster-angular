import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';

import { IdentityService } from '../identity/identity.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private identity: IdentityService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return from(this.updateRequestHeaders(req)).pipe(
      mergeMap(r => next.handle(r)),
    );
  }

  private async updateRequestHeaders(
    req: HttpRequest<any>,
  ): Promise<HttpRequest<any>> {
    if (!this.requestRequiresToken(req)) {
      return req;
    }

    if (!this.identity.token) {
      try {
        await this.identity.restoreSession();
      } catch (e) {}
    }
    return this.setBearerToken(req);
  }

  private setBearerToken(req: HttpRequest<any>): HttpRequest<any> {
    if (this.identity.token) {
      return req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.identity.token,
        },
      });
    }
    return req;
  }

  private requestRequiresToken(req: HttpRequest<any>): boolean {
    return !/\/login$/.test(req.url);
  }
}
