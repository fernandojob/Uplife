import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsAlimentacaoPage } from './tabs-alimentacao.page';

const routes: Routes = [
  {
    path: '',
    component: TabsAlimentacaoPage,
    children: [
      {
        path: 'alimentacao',
        children:[
          {
            path: '',
            loadChildren: () => import('../alimentacao/alimentacao.module').then(m => m.AlimentacaoPageModule)
          }
        ]
      },
      {
        path: 'historico-alimentacao',
        children: [
          {
            path: '',
            loadChildren: () => import('../historico-alimentacao/historico-alimentacao.module').then(m => m.HistoricoAlimentacaoPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/home/tabs-alimentacao/alimentacao',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/tabs-alimentacao/alimentacao',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsAlimentacaoPageRoutingModule {}
