import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsCorridaPageRoutingModule } from './tabs-corrida-routing.module';

import { TabsCorridaPage } from './tabs-corrida.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsCorridaPageRoutingModule
  ],
  declarations: [TabsCorridaPage]
})
export class TabsCorridaPageModule {}
