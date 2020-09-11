import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TastingNotesPage } from './tasting-notes.page';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: '',
    component: TastingNotesPage,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TastingNotesPageRoutingModule {}
