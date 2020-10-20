import { Subject } from 'rxjs';
import { DefaultSession } from '@ionic-enterprise/identity-vault';
import { IdentityService } from './identity.service';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj<IdentityService>('IdentityService', {
    init: Promise.resolve(),
    set: Promise.resolve(),
    clear: Promise.resolve(),
  });
  (mock as any).changed = new Subject<DefaultSession>();
  return mock;
}
