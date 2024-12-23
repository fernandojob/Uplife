import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { MaisInfoPageRoutingModule } from './mais-info-routing.module';

import { MaisInfoPage } from './mais-info.page';

@NgModule({ declarations: [MaisInfoPage], imports: [CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
        MaisInfoPageRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class MaisInfoPageModule {}
