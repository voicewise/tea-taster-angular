import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';

import { TastingNoteEditorComponent } from './tasting-note-editor.component';
import { SharedModule } from '@app/shared';
import { TeaService, TastingNotesService } from '@app/core';
import {
  createTeaServiceMock,
  createTastingNotesServiceMock,
} from '@app/core/testing';
import { createOverlayControllerMock } from '@test/mocks';

describe('TastingNoteEditorComponent', () => {
  let component: TastingNoteEditorComponent;
  let fixture: ComponentFixture<TastingNoteEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TastingNoteEditorComponent],
      imports: [FormsModule, IonicModule, SharedModule],
      providers: [
        {
          provide: ModalController,
          useFactory: () => createOverlayControllerMock('ModalController'),
        },
        {
          provide: TastingNotesService,
          useFactory: createTastingNotesServiceMock,
        },
        { provide: TeaService, useFactory: createTeaServiceMock },
      ],
    }).compileComponents();

    const teaService = TestBed.inject(TeaService);
    (teaService.getAll as any).and.returnValue(
      of([
        {
          id: 7,
          name: 'White',
          image: 'assets/img/white.jpg',
          description: 'White tea description.',
          rating: 5,
        },
        {
          id: 8,
          name: 'Yellow',
          image: 'assets/img/yellow.jpg',
          description: 'Yellow tea description.',
          rating: 3,
        },
      ]),
    );

    fixture = TestBed.createComponent(TastingNoteEditorComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('binds the tea select', () => {
      fixture.detectChanges();
      const sel = fixture.debugElement.query(By.css('ion-select'));
      const opts = sel.queryAll(By.css('ion-select-option'));
      expect(opts[0].nativeElement.value).toEqual('7');
      expect(opts[0].nativeElement.textContent).toEqual('White');
      expect(opts[1].nativeElement.value).toEqual('8');
      expect(opts[1].nativeElement.textContent).toEqual('Yellow');
    });

    describe('with a note', () => {
      beforeEach(() => {
        component.note = {
          id: 7,
          brand: 'Lipton',
          name: 'Yellow Label',
          notes: 'Overly acidic, highly tannic flavor',
          rating: 1,
          teaCategoryId: 3,
        };
        fixture.detectChanges();
      });

      it('sets the properties', () => {
        expect(component.brand).toEqual('Lipton');
        expect(component.name).toEqual('Yellow Label');
        expect(component.notes).toEqual('Overly acidic, highly tannic flavor');
        expect(component.rating).toEqual(1);
        expect(component.teaCategoryId).toEqual('3');
      });

      it('has the update title', () => {
        const el = fixture.debugElement.query(By.css('ion-title'));
        expect(el.nativeElement.textContent).toEqual('Tasting Note');
      });

      it('has the update button label', () => {
        const footer = fixture.debugElement.query(By.css('ion-footer'));
        const el = footer.query(By.css('ion-button'));
        expect(el.nativeElement.textContent).toEqual('Update');
      });
    });

    describe('without a note', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('has the add title', () => {
        const el = fixture.debugElement.query(By.css('ion-title'));
        expect(el.nativeElement.textContent).toEqual('Add New Tasting Note');
      });

      it('has the add button label', () => {
        const footer = fixture.debugElement.query(By.css('ion-footer'));
        const el = footer.query(By.css('ion-button'));
        expect(el.nativeElement.textContent).toEqual('Add');
      });
    });
  });

  describe('close', () => {
    it('dismisses the modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.close();
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    describe('a new note', () => {
      beforeEach(() => {
        const tastingNotesService = TestBed.inject(TastingNotesService);
        (tastingNotesService.save as any).and.returnValue(
          of({
            id: 73,
            brand: 'Lipton',
            name: 'Yellow Label',
            teaCategoryId: 3,
            rating: 1,
            notes: 'ick',
          }),
        );
        fixture.detectChanges();
      });

      it('saves the data', () => {
        const tastingNotesService = TestBed.inject(TastingNotesService);
        component.brand = 'Lipton';
        component.name = 'Yellow Label';
        component.teaCategoryId = '3';
        component.rating = 1;
        component.notes = 'ick';
        component.save();
        expect(tastingNotesService.save).toHaveBeenCalledTimes(1);
        expect(tastingNotesService.save).toHaveBeenCalledWith({
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        });
      });

      it('dismisses the modal', () => {
        const modalController = TestBed.inject(ModalController);
        component.save();
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });

    describe('an existing note', () => {
      beforeEach(() => {
        component.note = {
          id: 73,
          brand: 'Generic',
          name: 'White Label',
          teaCategoryId: 2,
          rating: 3,
          notes: 'it is ok',
        };
        const tastingNotesService = TestBed.inject(TastingNotesService);
        (tastingNotesService.save as any).and.returnValue(
          of({
            id: 73,
            brand: 'Lipton',
            name: 'Yellow Label',
            teaCategoryId: 3,
            rating: 1,
            notes: 'ick',
          }),
        );
        fixture.detectChanges();
      });

      it('saves the data', () => {
        const tastingNotesService = TestBed.inject(TastingNotesService);
        component.brand = 'Lipton';
        component.name = 'Yellow Label';
        component.teaCategoryId = '3';
        component.rating = 1;
        component.notes = 'ick';
        component.save();
        expect(tastingNotesService.save).toHaveBeenCalledTimes(1);
        expect(tastingNotesService.save).toHaveBeenCalledWith({
          id: 73,
          brand: 'Lipton',
          name: 'Yellow Label',
          teaCategoryId: 3,
          rating: 1,
          notes: 'ick',
        });
      });

      it('dismisses the modal', () => {
        const modalController = TestBed.inject(ModalController);
        component.save();
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
  });
});
