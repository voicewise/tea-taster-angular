import { Subject } from 'rxjs';
import { DefaultSession } from '@ionic-enterprise/identity-vault';
import { AuthMode } from '@ionic-enterprise/identity-vault';
import { IdentityService } from './identity.service';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj<IdentityService>('IdentityService', {
    set: Promise.resolve(),
    clear: Promise.resolve(),
    hasStoredSession: Promise.resolve(false),
    isBiometricsAvailable: Promise.resolve(false),
    getAuthMode: Promise.resolve(AuthMode.InMemoryOnly),
    restoreSession: Promise.resolve(null),
    useAuthMode: undefined,
  });
  (mock as any).changed = new Subject<DefaultSession>();
  return mock;
}
