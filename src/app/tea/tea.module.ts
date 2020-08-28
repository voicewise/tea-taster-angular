import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TeaPage } from './tea.page';

import { TeaPageRoutingModule } from './tea-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TeaPageRoutingModule],
  declarations: [TeaPage],
})
export class TeaPageModule {}
