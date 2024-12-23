import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController} from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-mudar-email',
  templateUrl: './mudar-email.page.html',
  styleUrls: ['./mudar-email.page.scss'],
})
export class MudarEmailPage {

  emailForm: FormGroup;
  senhaModal = false; 
  password: string = '';

  constructor(
    private location: Location,
    private router: Router,
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    private alertController: AlertController,
    private afs: AngularFirestore,
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  Voltarpagina() {
    this.location.back();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async reauthenticateUser() {
    const user = await this.afAuth.currentUser;
    if (user && user.email) {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, this.password);
      try {
        await user.reauthenticateWithCredential(credential);
        console.log('Reautenticação bem-sucedida');
        this.senhaModal = false;

        // Continua com a mudança de email e envio de verificação
        const newEmail = this.emailForm.get('email')?.value;
        await user.verifyBeforeUpdateEmail(newEmail);
        await this.afs.collection('users').doc(user.uid).update({ email: newEmail });
        await user.sendEmailVerification(); // Envia email de verificação
        this.presentAlert(
          'Sucesso',
          'Um e-mail de verificação foi enviado para o novo endereço de e-mail. Por favor, verifique sua caixa de entrada e siga as instruções.'
        );

        this.router.navigate(['confirmar-email']);

      } catch (error) {
        console.error('Erro na reautenticação:', error);
        this.presentAlert('Erro', 'Senha incorreta. Tente novamente.');
      }
    } else {
      console.error('Usuário ou email é nulo');
      throw new Error('Usuário ou email é nulo');
    }
  }
  
  async onSubmit() {
    if (this.emailForm.valid) {
      this.senhaModal = true;
    } else {
      this.emailForm.markAllAsTouched();
    }
  }  
}
