import { EMPTY } from 'rxjs';
import { AuthenticationService } from './authentication.service';

export function createAuthenticationServiceMock() {
  return jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    login: EMPTY,
    logout: EMPTY,
  });
}
