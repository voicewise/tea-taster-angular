import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { LoginPage } from './login.page';
import { AuthenticationService, IdentityService } from '@app/core';
import {
  createAuthenticationServiceMock,
  createIdentityServiceMock,
} from '@app/core/testing';
import { of } from 'rxjs';
import { createPlatformMock } from '@test/mocks';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginPage],
        imports: [FormsModule, IonicModule],
        providers: [
          {
            provide: AuthenticationService,
            useFactory: createAuthenticationServiceMock,
          },
          { provide: IdentityService, useFactory: createIdentityServiceMock },
          { provide: Platform, useFactory: createPlatformMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('init', () => {
    describe('in a web context', () => {
      it('hides the session storage selection', async () => {
        await component.ngOnInit();
        expect(component.displayLockingOptions).toEqual(false);
      });

      it('defaults the auth mode to secure storage', async () => {
        await component.ngOnInit();
        expect(component.authMode).toEqual(AuthMode.SecureStorage);
      });
    });

    describe('in a hybrid mobile context', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as any).withArgs('hybrid').and.returnValue(true);
      });

      it('uses a default set of auth modes', async () => {
        await component.ngOnInit();
        expect(component.authModes).toEqual([
          {
            mode: AuthMode.PasscodeOnly,
            label: 'Session PIN Unlock',
          },
          {
            mode: AuthMode.SecureStorage,
            label: 'Never Lock Session',
          },
          {
            mode: AuthMode.InMemoryOnly,
            label: 'Force Login',
          },
        ]);
      });

      it('defaults the auth mode to PIN', async () => {
        await component.ngOnInit();
        expect(component.authMode).toEqual(AuthMode.PasscodeOnly);
      });

      it('displays the session storage selection', async () => {
        await component.ngOnInit();
        expect(component.displayLockingOptions).toEqual(true);
      });

      describe('when biometrics are available', () => {
        beforeEach(() => {
          const identity = TestBed.inject(IdentityService);
          (identity.isBiometricsAvailable as any).and.returnValue(
            Promise.resolve(true),
          );
        });

        it('adds bio auth mode', async () => {
          await component.ngOnInit();
          expect(component.authModes).toEqual([
            {
              mode: AuthMode.BiometricOnly,
              label: 'Biometric Unlock',
            },
            {
              mode: AuthMode.PasscodeOnly,
              label: 'Session PIN Unlock',
            },
            {
              mode: AuthMode.SecureStorage,
              label: 'Never Lock Session',
            },
            {
              mode: AuthMode.InMemoryOnly,
              label: 'Force Login',
            },
          ]);
        });

        it('defaults the auth mode to Bio', async () => {
          await component.ngOnInit();
          expect(component.authMode).toEqual(AuthMode.BiometricOnly);
        });

        it('displays the session storage selection', async () => {
          await component.ngOnInit();
          expect(component.displayLockingOptions).toEqual(true);
        });
      });

      describe('without a stored session', () => {
        let identity: IdentityService;
        beforeEach(() => {
          identity = TestBed.inject(IdentityService);
          (identity.hasStoredSession as any).and.returnValue(
            Promise.resolve(false),
          );
        });

        it('sets displayVaultLogin to false', async () => {
          await component.ngOnInit();
          expect(component.displayVaultLogin).toEqual(false);
        });
      });

      describe('with a stored session', () => {
        let identity: IdentityService;
        beforeEach(() => {
          identity = TestBed.inject(IdentityService);
          (identity.hasStoredSession as any).and.returnValue(
            Promise.resolve(true),
          );
        });

        it('sets displayVaultLogin to true for passcode', async () => {
          (identity.getAuthMode as any).and.returnValue(
            Promise.resolve(AuthMode.PasscodeOnly),
          );
          await component.ngOnInit();
          expect(component.displayVaultLogin).toEqual(true);
        });

        it('sets displayVaultLogin to true for biometric and passcode', async () => {
          (identity.getAuthMode as any).and.returnValue(
            Promise.resolve(AuthMode.BiometricAndPasscode),
          );
          await component.ngOnInit();
          expect(component.displayVaultLogin).toEqual(true);
        });

        it('sets displayVaultLogin to false for biometric when bio is not available', async () => {
          (identity.getAuthMode as any).and.returnValue(
            Promise.resolve(AuthMode.BiometricOnly),
          );
          await component.ngOnInit();
          expect(component.displayVaultLogin).toEqual(false);
        });

        it('sets displayVaultLogin to true for biometric when bio is available', async () => {
          (identity.isBiometricsAvailable as any).and.returnValue(
            Promise.resolve(true),
          );
          (identity.getAuthMode as any).and.returnValue(
            Promise.resolve(AuthMode.BiometricOnly),
          );
          await component.ngOnInit();
          expect(component.displayVaultLogin).toEqual(true);
        });
      });
    });
  });

  describe('email input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#email-input');
      const event = new InputEvent('ionChange');

      input.value = 'test@test.com';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.email).toEqual('test@test.com');
    });

    it('updates the input when the component model changes', fakeAsync(() => {
      component.email = 'testy@mctesterson.com';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#email-input');
      expect(input.value).toEqual('testy@mctesterson.com');
    }));
  });

  describe('password input binding', () => {
    it('updates the component model when the input changes', () => {
      const input = fixture.nativeElement.querySelector('#password-input');
      const event = new InputEvent('ionChange');

      input.value = 'IAmAPa$$word';
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.password).toEqual('IAmAPa$$word');
    });

    it('updates the input when the component model changes', fakeAsync(() => {
      component.password = 'IAmAPa$$word';
      fixture.detectChanges();
      tick();
      const input = fixture.nativeElement.querySelector('#password-input');
      expect(input.value).toEqual('IAmAPa$$word');
    }));
  });

  describe('signon button', () => {
    let button: HTMLIonButtonElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;
    beforeEach(fakeAsync(() => {
      button = fixture.nativeElement.querySelector('ion-button');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
      fixture.detectChanges();
      tick();
    }));

    it('starts disabled', () => {
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just an email address', () => {
      setInputValue(email, 'test@test.com');
      expect(button.disabled).toEqual(true);
    });

    it('is disabled with just a password', () => {
      setInputValue(password, 'YouShallNotPa$$');
      expect(button.disabled).toEqual(true);
    });

    it('is enabled with both an email address and a password', () => {
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'YouShallNotPa$$');
      expect(button.disabled).toEqual(false);
    });

    it('is disabled when the email address is not a valid format', () => {
      setInputValue(email, 'testtest.com');
      setInputValue(password, 'YouShallNotPa$$');
      expect(button.disabled).toEqual(true);
    });

    it('sets the selected auth mode', () => {
      const identity = TestBed.inject(IdentityService);
      component.authMode = AuthMode.InMemoryOnly;
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'password');
      click(button);
      expect(identity.useAuthMode).toHaveBeenCalledTimes(1);
      expect(identity.useAuthMode).toHaveBeenCalledWith(AuthMode.InMemoryOnly);
    });

    it('performs a login on clicked', () => {
      const authenticationService = TestBed.inject(AuthenticationService);
      setInputValue(email, 'test@test.com');
      setInputValue(password, 'password');
      click(button);
      expect(authenticationService.login).toHaveBeenCalledTimes(1);
      expect(authenticationService.login).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
    });

    it('sets an error message if the login failed', () => {
      const authenticationService = TestBed.inject(AuthenticationService);
      const errorDiv: HTMLDivElement = fixture.nativeElement.querySelector(
        '.error-message',
      );
      (authenticationService.login as any).and.returnValue(of(false));
      click(button);
      expect(errorDiv.textContent.trim()).toEqual(
        'Invalid e-mail address or password',
      );
    });
  });

  describe('error messages', () => {
    let errorDiv: HTMLDivElement;
    let email: HTMLIonInputElement;
    let password: HTMLIonInputElement;
    beforeEach(fakeAsync(() => {
      errorDiv = fixture.nativeElement.querySelector('.error-message');
      email = fixture.nativeElement.querySelector('#email-input');
      password = fixture.nativeElement.querySelector('#password-input');
      fixture.detectChanges();
      tick();
    }));

    it('starts with no error message', () => {
      fixture.detectChanges();
      expect(errorDiv.textContent).toEqual('');
    });

    it('displays an error message if the e-mail address is dirty and empty', () => {
      setInputValue(email, 'test@test.com');
      setInputValue(email, '');
      expect(errorDiv.textContent.trim()).toEqual('E-Mail Address is required');
    });

    it('displays an error message if the e-mail address has an invalid format', () => {
      setInputValue(email, 'testtest.com');
      expect(errorDiv.textContent.trim()).toEqual(
        'E-Mail Address must have a valid format',
      );
    });

    it('clears the error message when the e-mail address has a valid format', () => {
      setInputValue(email, 'testtest.com');
      expect(errorDiv.textContent.trim()).toEqual(
        'E-Mail Address must have a valid format',
      );
      setInputValue(email, 'test@test.com');
      expect(errorDiv.textContent.trim()).toEqual('');
    });

    it('displays an error message if the password is dirty and empty', () => {
      setInputValue(password, 'password');
      setInputValue(password, '');
      expect(errorDiv.textContent.trim()).toEqual('Password is required');
    });
  });

  function click(button: HTMLIonButtonElement) {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  }

  function setInputValue(input: HTMLIonInputElement, value: string) {
    const event = new InputEvent('ionChange');
    input.value = value;
    input.dispatchEvent(event);
    fixture.detectChanges();
  }
});
