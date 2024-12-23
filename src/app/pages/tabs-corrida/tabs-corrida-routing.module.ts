import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsCorridaPage } from './tabs-corrida.page';

const routes: Routes = [
  {
    path: '',
    component: TabsCorridaPage,
    children: [
      {
        path: 'corrida',
        children:[
          {
            path: '',
            loadChildren: () => import('../corrida/corrida.module').then(m => m.CorridaPageModule)
          }
        ]
      },
      {
        path: 'historico',
        children: [
          {
            path: '',
            loadChildren: () => import('../historico/historico.module').then(m => m.HistoricoPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/home/tabsCorrida/corrida',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/tabsCorrida/corrida',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsCorridaPageRoutingModule {}
