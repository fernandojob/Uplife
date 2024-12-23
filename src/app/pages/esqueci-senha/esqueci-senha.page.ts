import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-esqueci-senha',
  templateUrl: './esqueci-senha.page.html',
  styleUrls: ['./esqueci-senha.page.scss'],
})
export class EsqueciSenhaPage implements OnInit {

  senhaForm: FormGroup;

  constructor(private location: Location, private router: Router, private formBuilder: FormBuilder, private afAuth: AngularFireAuth, private alertController: AlertController){
    this.senhaForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    }) 
  }

  ngOnInit() {
  }

  Voltarpagina(){
    this.location.back();
  }

  async onSubmit() {
    if (this.senhaForm.valid) {
      const email = this.senhaForm.get('email')?.value;
      try {
        await this.afAuth.sendPasswordResetEmail(email);
        const alert = await this.alertController.create({
          header: 'Sucesso',
          message: 'Um link de redefinição de senha foi enviado para seu e-mail.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/login']); // Altere para a página de login
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Ocorreu um erro ao enviar o e-mail. Verifique se o e-mail está correto e tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      this.senhaForm.markAllAsTouched();
    }
  }

}
