import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TastingNotesPageRoutingModule } from './tasting-notes-routing.module';

import { TastingNotesPage } from './tasting-notes.page';
import { TastingNoteEditorModule } from './tasting-note-editor/tasting-note-editor.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TastingNoteEditorModule,
    TastingNotesPageRoutingModule,
  ],
  declarations: [TastingNotesPage],
})
export class TastingNotesPageModule {}
