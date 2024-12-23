import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { RegistroPageRoutingModule } from './registro-routing.module';

import { RegistroPage } from './registro.page';

@NgModule({ declarations: [RegistroPage], imports: [CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
        RegistroPageRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class RegistroPageModule {}
