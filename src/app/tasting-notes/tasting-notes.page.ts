import { Component, OnInit } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { TastingNoteEditorComponent } from './tasting-note-editor/tasting-note-editor.component';
import { TastingNote } from '@app/models';
import { TastingNotesService } from '@app/core';

@Component({
  selector: 'app-tasting-notes',
  templateUrl: './tasting-notes.page.html',
  styleUrls: ['./tasting-notes.page.scss'],
})
export class TastingNotesPage implements OnInit {
  private refresh: BehaviorSubject<void>;
  notes$: Observable<Array<TastingNote>>;

  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private tastingNotesService: TastingNotesService,
  ) {
    this.refresh = new BehaviorSubject(null);
  }

  ngOnInit() {
    this.notes$ = this.refresh.pipe(
      switchMap(() => this.tastingNotesService.getAll()),
    );
  }

  async newNote(): Promise<void> {
    await this.displayEditor();
  }

  async updateNote(note: TastingNote): Promise<void> {
    await this.displayEditor(note);
  }

  deleteNote(note: TastingNote): void {
    this.tastingNotesService
      .delete(note.id)
      .pipe(tap(() => this.refresh.next()))
      .subscribe();
  }

  private async displayEditor(note?: TastingNote): Promise<void> {
    const opt = {
      component: TastingNoteEditorComponent,
      backdropDismiss: false,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    };
    if (note) {
      (opt as any).componentProps = { note };
    }
    const modal = await this.modalController.create(opt);
    await modal.present();
    await modal.onDidDismiss();
    this.refresh.next();
  }
}
