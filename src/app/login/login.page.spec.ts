import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { of } from 'rxjs';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [FormsModule, IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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
