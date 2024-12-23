import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MudarEmailPage } from './mudar-email.page';

const routes: Routes = [
  {
    path: '',
    component: MudarEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MudarEmailPageRoutingModule {}
