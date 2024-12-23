import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { RegistroService } from 'src/app/sevices/registro.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Component({
  selector: 'app-inicial',
  templateUrl: './inicial.page.html',
  styleUrls: ['./inicial.page.scss'],
})
export class InicialPage implements OnInit {

  constructor(private router: Router, private afAuth: AngularFireAuth, private firestore: AngularFirestore, private registroService: RegistroService){}

  ngOnInit() {}

  IrparaRegistro(){
    this.router.navigate(['registro'])
  }

  IrparaLogin(){
    this.router.navigate(['login'])
  }

  async loginComGoogle() {
    try {
      const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

      if (result.user) {
        const userGoogleData = result.user;
        const userDoc = await this.firestore.collection('users').doc(userGoogleData.uid).get().toPromise();
        
        if(userDoc && userDoc.exists){
          this.router.navigate(['home']);
        }

        else{

          const userData = {
            user_id: userGoogleData.uid,
            nome: userGoogleData.displayName,
            email: userGoogleData.email,
            fotoPerfil: userGoogleData.photoURL,
          };

          const response = await this.registroService.dadosGoogle(userData);

          if (response.message === 'Usuário já registrado!') {
            this.router.navigate(['home']);
          } 
          
          else {
            this.router.navigate(['mais-info']);
          }
        }
      } 
      
      else {
        console.error('Nenhum usuário retornado do Google login');
      }

    } 
    
    catch (error) {
      console.error('Erro ao fazer login com o Google:', error);
    }

  }

}
