import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MudarEmailPageRoutingModule } from './mudar-email-routing.module';

import { MudarEmailPage } from './mudar-email.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    MudarEmailPageRoutingModule
  ],
  declarations: [MudarEmailPage]
})
export class MudarEmailPageModule {}
