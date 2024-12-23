import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-corrida',
  templateUrl: './config-corrida.page.html',
  styleUrls: ['./config-corrida.page.scss'],
})

export class ConfigCorridaPage implements OnInit {

  placeholderMeta: string = 'Desativado';
  parametro: string = ''

  configuracoes: any = {
    pausaAutomatica: false,
    contagemRegressiva: 'desativada',
    tipoVoz: 'desativado',
    frequenciaAudio: '1km',
    duracaoComentario: false,
    distanciaComentario: false,
    ritmoComentario: false,
    medidor: 'nenhum',
    meta: ''
  };

  constructor(private location: Location, private afAuth: AngularFireAuth, private firestore: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.carregarConfiguracoes();
  }

  Voltarpagina() {
    this.location.back();
  }

  async carregarConfiguracoes() {
    
    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        const userId = user.uid;

        this.firestore.collection('configuracoesCorrida').doc(userId).valueChanges().subscribe({
          next: (userData: any) => {
            if (userData) {
              Object.assign(this.configuracoes, userData);
              this.atualizarPlaceholder();
            }
          },
          error: (error) => {
            console.error("Erro ao carregar os dados: ", error);
          }
        });
      }

      else{
        console.log('sem usuario')
      }
    });

  }
  
  atualizarPlaceholder() {
    if (this.configuracoes.medidor === 'nenhum') {
      this.placeholderMeta = 'Desativado';
      this.configuracoes.meta = '';
      this.parametro = ''
    } 
    
    else if (this.configuracoes.medidor === 'distancia') {
      this.placeholderMeta = 'Distância | KM';
      this.parametro = '(Em quilômetros)'
    } 
    
    else if (this.configuracoes.medidor === 'duracao') {
      this.placeholderMeta = 'Duração | Min';
      this.parametro = '(Em minutos)'
    }
  }

 async salvar(){
    try {
      const user = await this.afAuth.currentUser;
      if (user) {

        const userId = user.uid;

        await this.firestore.collection('configuracoesCorrida').doc(userId).set({
          user_id: userId,
          pausaAutomatica: this.configuracoes.pausaAutomatica,
          contagemRegressiva: this.configuracoes.contagemRegressiva,
          tipoVoz: this.configuracoes.tipoVoz,
          frequenciaAudio: this.configuracoes.frequenciaAudio,
          duracaoComentario: this.configuracoes.duracaoComentario,
          distanciaComentario: this.configuracoes.distanciaComentario,
          ritmoComentario: this.configuracoes.ritmoComentario,
          medidor: this.configuracoes.medidor,
          meta: this.configuracoes.meta
        });

        this.router.navigate(['home/tabsCorrida/corrida']);

      } 
      
      else {
        console.error("Usuário não autenticado");
      }
    } catch (error) {
      console.error("Erro ao salvar os dados: ", error);
    }
  }

}