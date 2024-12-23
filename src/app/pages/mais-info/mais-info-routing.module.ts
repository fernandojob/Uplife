import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaisInfoPage } from './mais-info.page';

const routes: Routes = [
  {
    path: '',
    component: MaisInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaisInfoPageRoutingModule {}
