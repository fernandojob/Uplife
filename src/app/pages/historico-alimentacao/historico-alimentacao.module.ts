import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoricoAlimentacaoPageRoutingModule } from './historico-alimentacao-routing.module';

import { HistoricoAlimentacaoPage } from './historico-alimentacao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoricoAlimentacaoPageRoutingModule
  ],
  declarations: [HistoricoAlimentacaoPage]
})
export class HistoricoAlimentacaoPageModule {}
