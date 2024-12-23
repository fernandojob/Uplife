import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsAlimentacaoPageRoutingModule } from './tabs-alimentacao-routing.module';

import { TabsAlimentacaoPage } from './tabs-alimentacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsAlimentacaoPageRoutingModule
  ],
  declarations: [TabsAlimentacaoPage]
})
export class TabsAlimentacaoPageModule {}
