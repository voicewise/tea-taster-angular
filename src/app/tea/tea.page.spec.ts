import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';

import { TeaPage } from './tea.page';
import { AuthenticationService, TeaService } from '@app/core';
import {
  createAuthenticationServiceMock,
  createTeaServiceMock,
} from '@app/core/testing';
import { createNavControllerMock } from '@test/mocks';

describe('TeaPage', () => {
  let component: TeaPage;
  let fixture: ComponentFixture<TeaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeaPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
        {
          provide: NavController,
          useFactory: createNavControllerMock,
        },
        {
          provide: TeaService,
          useFactory: createTeaServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeaPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('gets the teas', () => {
      const teaService = TestBed.inject(TeaService);
      fixture.detectChanges();
      expect(teaService.getAll).toHaveBeenCalledTimes(1);
    });

    it('displays an empty matrix if there is no tea', () => {
      const teaService = TestBed.inject(TeaService);
      (teaService.getAll as any).and.returnValue(of([]));
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('ion-row'));
      expect(rows.length).toEqual(0);
    });

    it('displays a 1x4 matrix for 4 teas', () => {
      const teaService = TestBed.inject(TeaService);
      (teaService.getAll as any).and.returnValue(
        of([
          {
            id: 1,
            name: 'Green',
            image: 'assets/img/green.jpg',
            description: 'Green tea description.',
          },
          {
            id: 2,
            name: 'Black',
            image: 'assets/img/black.jpg',
            description: 'Black tea description.',
          },
          {
            id: 3,
            name: 'Herbal',
            image: 'assets/img/herbal.jpg',
            description: 'Herbal Infusion description.',
          },
          {
            id: 4,
            name: 'Oolong',
            image: 'assets/img/oolong.jpg',
            description: 'Oolong tea description.',
          },
        ]),
      );
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('ion-row'));
      expect(rows.length).toEqual(1);
      const cols = rows[0].queryAll(By.css('ion-col'));
      expect(cols.length).toEqual(4);
    });

    it('displays a 2x4 matrix with two empty spots in the last row for 6 teas', () => {
      const teaService = TestBed.inject(TeaService);
      (teaService.getAll as any).and.returnValue(
        of([
          {
            id: 1,
            name: 'Green',
            image: 'assets/img/green.jpg',
            description: 'Green tea description.',
          },
          {
            id: 2,
            name: 'Black',
            image: 'assets/img/black.jpg',
            description: 'Black tea description.',
          },
          {
            id: 3,
            name: 'Herbal',
            image: 'assets/img/herbal.jpg',
            description: 'Herbal Infusion description.',
          },
          {
            id: 4,
            name: 'Oolong',
            image: 'assets/img/oolong.jpg',
            description: 'Oolong tea description.',
          },
        ]),
      );
      fixture.detectChanges();
      const rows = fixture.debugElement.queryAll(By.css('ion-row'));
      expect(rows.length).toEqual(1);
      const cols = rows[0].queryAll(By.css('ion-col'));
      expect(cols.length).toEqual(4);
    });
  });

  describe('show details page', () => {
    it('navigates forward', () => {
      const navController = TestBed.inject(NavController);
      component.showDetailsPage(42);
      expect(navController.navigateForward).toHaveBeenCalledTimes(1);
    });

    it('passes the details page and the ID', () => {
      const navController = TestBed.inject(NavController);
      component.showDetailsPage(42);
      expect(navController.navigateForward).toHaveBeenCalledWith([
        'tabs',
        'tea',
        'tea-details',
        42,
      ]);
    });
  });
});
