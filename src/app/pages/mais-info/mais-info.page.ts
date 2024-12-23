import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistroService } from 'src/app/sevices/registro.service';

@Component({
  selector: 'app-mais-info',
  templateUrl: './mais-info.page.html',
  styleUrls: ['./mais-info.page.scss'],
})
export class MaisInfoPage implements OnInit {

  userForm: FormGroup;

  constructor(private location: Location, private router: Router, private formBuilder: FormBuilder, private registroService: RegistroService){

    this.userForm = this.formBuilder.group({
      DTnascimento: ['', Validators.required],
      sexo: ['', Validators.required],
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      atividade: ['', Validators.required],
      objetivo: ['', Validators.required],
    });

  }

  ngOnInit() {
  }

  Voltarpagina(){
    this.location.back();
  }

  async onSubmit(){
    if (this.userForm.valid) {
      let user = { ...this.userForm.value };

      try {
        const response = await this.registroService.registrarUsuario(user);
        
        if (response.GoogleUser) {
          this.router.navigate(['home']);
        } 
        
        else {
          this.router.navigate(['login']);
        }

      } 
      
      catch (error: any) {
        console.error(error);
      }
      
    }

    else {
      this.userForm.markAllAsTouched();
    }
  }

}
