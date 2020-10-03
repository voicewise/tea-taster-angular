import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';

import { TeaDetailsPage } from './tea-details.page';
import { createActivatedRouteMock, createNavControllerMock } from '@test/mocks';
import { TeaService } from '@app/core';
import { createTeaServiceMock } from '@app/core/testing';
import { SharedModule } from '@app/shared';

describe('TeaDetailsPage', () => {
  let component: TeaDetailsPage;
  let fixture: ComponentFixture<TeaDetailsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeaDetailsPage],
        imports: [FormsModule, IonicModule, SharedModule],
        providers: [
          { provide: ActivatedRoute, useFactory: createActivatedRouteMock },
          { provide: NavController, useFactory: createNavControllerMock },
          { provide: TeaService, useFactory: createTeaServiceMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TeaDetailsPage);
      component = fixture.componentInstance;
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('determines the ID from the route', () => {
      const route = TestBed.inject(ActivatedRoute);
      fixture.detectChanges();
      expect(route.snapshot.paramMap.get).toHaveBeenCalledTimes(1);
      expect(route.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    });

    it('gets the tea of the ID', () => {
      const route = TestBed.inject(ActivatedRoute);
      const teaService = TestBed.inject(TeaService);
      (route.snapshot.paramMap.get as any).and.returnValue('42');
      fixture.detectChanges();
      expect(teaService.get).toHaveBeenCalledTimes(1);
      expect(teaService.get).toHaveBeenCalledWith(42);
    });

    it('displays the tea', () => {
      const route = TestBed.inject(ActivatedRoute);
      const teaService = TestBed.inject(TeaService);
      (teaService.get as any).and.returnValue(
        of({
          id: 42,
          name: 'Yellow',
          image: 'assets/img/yellow.jpg',
          description: 'Yellow tea description.',
        }),
      );
      (route.snapshot.paramMap.get as any).and.returnValue('42');
      fixture.detectChanges();
      const h1 = fixture.debugElement.query(By.css('h1'));
      expect(h1.nativeElement.textContent).toEqual('Yellow');
      const p = fixture.debugElement.query(By.css('p'));
      expect(p.nativeElement.textContent).toEqual('Yellow tea description.');
    });

    it('sets the rating', () => {
      const route = TestBed.inject(ActivatedRoute);
      const teaService = TestBed.inject(TeaService);
      (teaService.get as any).and.returnValue(
        of({
          id: 42,
          name: 'Yellow',
          image: 'assets/img/yellow.jpg',
          description: 'Yellow tea description.',
          rating: 2,
        }),
      );
      (route.snapshot.paramMap.get as any).and.returnValue('42');
      fixture.detectChanges();
      expect(component.rating).toEqual(2);
    });
  });

  describe('rating changed', () => {
    let teaService: TeaService;
    beforeEach(() => {
      const route = TestBed.inject(ActivatedRoute);
      teaService = TestBed.inject(TeaService);
      (teaService.get as any).and.returnValue(
        of({
          id: 42,
          name: 'Yellow',
          image: 'assets/img/yellow.jpg',
          description: 'Yellow tea description.',
        }),
      );
      (route.snapshot.paramMap.get as any).and.returnValue('42');
      fixture.detectChanges();
    });

    it('updates the tea', () => {
      component.rating = 4;
      component.ratingChanged();
      expect(component.tea).toEqual({
        id: 42,
        name: 'Yellow',
        image: 'assets/img/yellow.jpg',
        description: 'Yellow tea description.',
        rating: 4,
      });
    });

    it('saves the change', () => {
      component.rating = 4;
      component.ratingChanged();
      expect(teaService.save).toHaveBeenCalledTimes(1);
      expect(teaService.save).toHaveBeenCalledWith({
        id: 42,
        name: 'Yellow',
        image: 'assets/img/yellow.jpg',
        description: 'Yellow tea description.',
        rating: 4,
      });
    });
  });
});
