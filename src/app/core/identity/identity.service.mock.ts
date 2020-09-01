import { Subject } from 'rxjs';
import { User } from '@app/models';
import { IdentityService } from './identity.service';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj<IdentityService>('IdentityService', {
    init: Promise.resolve(),
    set: Promise.resolve(),
    clear: Promise.resolve(),
  });
  (mock as any).changed = new Subject<User>();
  return mock;
}
