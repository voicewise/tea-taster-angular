import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeaPage } from './tea.page';
import { AuthGuardService } from '@app/core';

const routes: Routes = [
  {
    path: '',
    component: TeaPage,
    canActivate: [AuthGuardService],
  },
  {
    path: 'tea-details',
    loadChildren: () =>
      import('../tea-details/tea-details.module').then(
        m => m.TeaDetailsPageModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeaPageRoutingModule {}
