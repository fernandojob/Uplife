import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigCorridaPage } from './config-corrida.page';

const routes: Routes = [
  {
    path: '',
    component: ConfigCorridaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigCorridaPageRoutingModule {}
