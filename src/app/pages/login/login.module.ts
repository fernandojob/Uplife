import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';

@NgModule({ declarations: [LoginPage], imports: [CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
        LoginPageRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class LoginPageModule {}
