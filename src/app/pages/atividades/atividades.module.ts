import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


import { IonicModule } from '@ionic/angular';

import { AtividadesPageRoutingModule } from './atividades-routing.module';

import { AtividadesPage } from './atividades.page';


@NgModule({ declarations: [AtividadesPage], imports: [CommonModule,
        FormsModule,
        IonicModule,
        AtividadesPageRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AtividadesPageModule {}
