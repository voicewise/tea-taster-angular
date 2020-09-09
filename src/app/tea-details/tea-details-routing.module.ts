import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeaDetailsPage } from './tea-details.page';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: ':id',
    component: TeaDetailsPage,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaDetailsPageRoutingModule {}
