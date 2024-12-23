import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  tempUserId: string = ''
  tempGoogleId: string = ''

  tempDados: any = ''
  tempGoogleDados: any =''

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore){}

  async dadosUsuario(dados: any){
    let autenticacao = {
      email: dados.email,
      senha: dados.senha
    };
  
    this.tempDados = {
      nome: dados.nome,
      email: dados.email,
      fotoPerfil: dados.fotoPerfil,
    };

    try {

      const verificarEmail = await this.afAuth.fetchSignInMethodsForEmail(autenticacao.email);

      if (verificarEmail.length > 0) {
        throw new Error('Email já está em uso!');
      } 
      
      else {

        const autenticacaoSave = await this.afAuth.createUserWithEmailAndPassword(autenticacao.email, autenticacao.senha);

        if (autenticacaoSave.user) {
          this.tempUserId = autenticacaoSave.user.uid;
          return { message: 'Dados do primeiro formulário recebidos!' };
        } 
        
        else {
          throw new Error('Erro ao criar usuário!');
        }
      }

    } 
    
    catch (error: any) {
      return { message: 'Erro ao verificar e-mail ou criar usuário!', error: error.message };
    }

  }

  async dadosGoogle(dados: any){

    this.tempGoogleDados = {
      user_id: dados.user_id,
      nome: dados.nome,
      email: dados.email,
      fotoPerfil: dados.fotoPerfil,
      google: 'sim'
    };

    const userDoc = await this.firestore.collection('users').doc(this.tempGoogleDados.user_id).get().toPromise();

    if (userDoc?.exists) {
      return { message: 'Usuário já registrado!' };
    } 
    
    else {
      this.tempGoogleId = this.tempGoogleDados.user_id;
      return { message: 'Dados do primeiro formulário recebidos!' };
    }

  }

  async registrarUsuario(dados: any){
    let user: any;
    let GoogleUser = false;

    if(this.tempDados){

      user =  {
        ...this.tempDados,
        ...dados,
        user_id: this.tempUserId
      }

    }

    else if(this.tempGoogleDados){

      user =  {
        ...this.tempGoogleDados,
        ...dados,
        user_id: this.tempGoogleId
      }

      GoogleUser = true

    }

    else{
      console.error('Nenhum usuário temporário encontrado!')
    }

    try {

      await this.firestore.collection('users').doc(user.user_id).set(user);

      return { message: 'Dados do segundo formulário recebidos!', GoogleUser };
    } 
    
    catch (error: any) {
      throw new Error('Erro ao gravar dados: ' + error.message);
    }

  }

}
