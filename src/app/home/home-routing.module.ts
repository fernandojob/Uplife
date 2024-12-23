import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'inicio',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/inicio/inicio.module').then(m => m.InicioPageModule)
          }
        ]
      },
      {
        path: 'tabsCorrida',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/tabs-corrida/tabs-corrida.module').then(m => m.TabsCorridaPageModule)
          }
        ]
      },
      {
        path: 'tabs-alimentacao',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/tabs-alimentacao/tabs-alimentacao.module').then(m => m.TabsAlimentacaoPageModule)
          }
        ]
      },
      {
        path: 'atividades',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/atividades/atividades.module').then(m => m.AtividadesPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/home/inicio',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HomePageRoutingModule {}
