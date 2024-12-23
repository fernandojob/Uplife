import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarContaPageRoutingModule } from './editar-conta-routing.module';

import { EditarContaPage } from './editar-conta.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    EditarContaPageRoutingModule
  ],
  declarations: [EditarContaPage]
})
export class EditarContaPageModule {}
