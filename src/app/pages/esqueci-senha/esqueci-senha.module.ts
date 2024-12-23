import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EsqueciSenhaPageRoutingModule } from './esqueci-senha-routing.module';

import { EsqueciSenhaPage } from './esqueci-senha.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    EsqueciSenhaPageRoutingModule
  ],
  declarations: [EsqueciSenhaPage]
})
export class EsqueciSenhaPageModule {}
