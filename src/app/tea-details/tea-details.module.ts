import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeaDetailsPageRoutingModule } from './tea-details-routing.module';

import { TeaDetailsPage } from './tea-details.page';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TeaDetailsPageRoutingModule,
  ],
  declarations: [TeaDetailsPage],
})
export class TeaDetailsPageModule {}
