import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CorridaPage } from './corrida.page';

const routes: Routes = [
  {
    path: '',
    component: CorridaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorridaPageRoutingModule {}