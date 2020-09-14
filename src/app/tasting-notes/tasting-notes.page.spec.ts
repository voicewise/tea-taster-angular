import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, IonRouterOutlet } from '@ionic/angular';

import { TastingNotesPage } from './tasting-notes.page';
import {
  createOverlayControllerMock,
  createOverlayElementMock,
} from '@test/mocks';
import { TastingNoteEditorComponent } from './tasting-note-editor/tasting-note-editor.component';
import { TastingNoteEditorModule } from './tasting-note-editor/tasting-note-editor.module';
import { TastingNotesService } from '@app/core';
import { createTastingNotesServiceMock } from '@app/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TastingNote } from '@app/models';

describe('TastingNotesPage', () => {
  let component: TastingNotesPage;
  let fixture: ComponentFixture<TastingNotesPage>;
  let modal: HTMLIonModalElement;
  let testData: Array<TastingNote>;

  const mockRouterOutlet = {
    nativeEl: {},
  };

  beforeEach(async(() => {
    initializeTestData();
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      declarations: [TastingNotesPage],
      imports: [IonicModule, TastingNoteEditorModule],
      providers: [
        {
          provide: ModalController,
          useFactory: () =>
            createOverlayControllerMock('ModalController', modal),
        },
        { provide: IonRouterOutlet, useValue: mockRouterOutlet },
        {
          provide: TastingNotesService,
          useFactory: createTastingNotesServiceMock,
        },
      ],
    }).compileComponents();

    const tastingNotesService = TestBed.inject(TastingNotesService);
    (tastingNotesService.getAll as any).and.returnValue(of(testData));

    fixture = TestBed.createComponent(TastingNotesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('gets all of the notes', () => {
      const tastingNotesService = TestBed.inject(TastingNotesService);
      expect(tastingNotesService.getAll).toHaveBeenCalledTimes(1);
    });

    it('displays the notes', () => {
      const items = fixture.debugElement.queryAll(By.css('ion-item'));
      expect(items.length).toEqual(2);
      expect(items[0].nativeElement.textContent).toContain('Bently');
      expect(items[1].nativeElement.textContent).toContain('Lipton');
    });
  });

  describe('add new note', () => {
    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.newNote();
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        swipeToClose: true,
        presentingElement: mockRouterOutlet.nativeEl as any,
      });
    });

    it('displays the editor modal', async () => {
      await component.newNote();
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('waits for the dismiss', async () => {
      await component.newNote();
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
    });

    it('refreshes the notes list', async () => {
      const tastingNotesService = TestBed.inject(TastingNotesService);
      await component.newNote();
      expect(tastingNotesService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('update existing note', () => {
    let note: TastingNote;
    beforeEach(() => {
      note = {
        id: 73,
        brand: 'Lipton',
        name: 'Yellow Label',
        teaCategoryId: 3,
        rating: 1,
        notes: 'ick',
      };
    });

    it('creates the editor modal', () => {
      const modalController = TestBed.inject(ModalController);
      component.updateNote(note);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        component: TastingNoteEditorComponent,
        backdropDismiss: false,
        swipeToClose: true,
        presentingElement: mockRouterOutlet.nativeEl as any,
        componentProps: { note },
      });
    });

    it('displays the editor modal', async () => {
      await component.updateNote(note);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('waits for the dismiss', async () => {
      await component.updateNote(note);
      expect(modal.onDidDismiss).toHaveBeenCalledTimes(1);
    });

    it('refreshes the notes list', async () => {
      const tastingNotesService = TestBed.inject(TastingNotesService);
      await component.updateNote(note);
      expect(tastingNotesService.getAll).toHaveBeenCalledTimes(2);
    });
  });

  function initializeTestData() {
    testData = [
      {
        id: 73,
        brand: 'Bently',
        name: 'Brown Label',
        notes: 'Essentially OK',
        rating: 3,
        teaCategoryId: 2,
      },
      {
        id: 42,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      },
    ];
  }
});
