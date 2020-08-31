import { Subject } from 'rxjs';
import { User } from '@app/models';

export function createIdentityServiceMock() {
  const mock = jasmine.createSpyObj('IdentityService', {
    init: Promise.resolve(),
    set: Promise.resolve(),
    clear: Promise.resolve(),
  });
  mock.changed = new Subject<User>();
  return mock;
}
