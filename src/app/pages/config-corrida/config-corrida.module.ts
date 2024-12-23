import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfigCorridaPageRoutingModule } from './config-corrida-routing.module';

import { ConfigCorridaPage } from './config-corrida.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfigCorridaPageRoutingModule
  ],
  declarations: [ConfigCorridaPage]
})
export class ConfigCorridaPageModule {}
