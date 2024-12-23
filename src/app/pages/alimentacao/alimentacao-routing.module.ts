import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlimentacaoPage } from './alimentacao.page';

const routes: Routes = [
  {
    path: '',
    component: AlimentacaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlimentacaoPageRoutingModule {}
