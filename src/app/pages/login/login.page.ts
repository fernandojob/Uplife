import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(private location: Location, private router: Router, private formBuilder: FormBuilder, private afAuth: AngularFireAuth, private firestore: AngularFirestore){

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      manter: [false]
    }) 

    this.errorMessage = '';

  }

  ngOnInit() {
  }

  Voltarpagina(){
    this.location.back();
  }

  irParaRegistro(){
    this.router.navigate(['registro']);
  }

  irParaEsqueciSenha(){
    this.router.navigate(['esqueci-senha']);
  }

  errorMessage: string;

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, senha, manter } = this.loginForm.value;
  
      try {

        if (manter) {
          await this.afAuth.setPersistence('local');
        } 
        
        else {
          await this.afAuth.setPersistence('session');
        }

        const userCredential = await this.afAuth.signInWithEmailAndPassword(email, senha);
  
        if (userCredential) {
          const user = userCredential.user;

          if (user) {
            // Verificar se o usuário existe no Firestore
            const userDoc = await this.firestore.collection('users').doc(user.uid).get().toPromise();

            if (userDoc && userDoc.exists){
              this.router.navigate(['home']);
            } 
            
            else {
              throw new Error('Usuário não encontrado no banco de dados');
            }

          } 
          
          else {
            throw new Error('Usuário não encontrado após autenticação');
          }

        } 
        
        else {
          throw new Error('Credenciais de usuário não encontradas após autenticação');
        }
  
      } 
      
      catch (error: any) {
        console.error(error);
        this.errorMessage = error.message;
      }
      
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
  
  
  
}
