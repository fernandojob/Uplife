import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { AlimentacaoPageRoutingModule } from './alimentacao-routing.module';

import { AlimentacaoPage } from './alimentacao.page';

@NgModule({ declarations: [AlimentacaoPage], imports: [CommonModule,
        FormsModule,
        IonicModule,
        AlimentacaoPageRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AlimentacaoPageModule {}
