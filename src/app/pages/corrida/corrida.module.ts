import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorridaPageRoutingModule } from './corrida-routing.module';

import { CorridaPage } from './corrida.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorridaPageRoutingModule
  ],
  declarations: [CorridaPage]
})
export class CorridaPageModule {}
