import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface Corrida {
  corrida_id: string;
  dia: string;
  hora: string;
  distancia: string;
  duracao: string;
  ritmoMedio: string;
  calorias: number;
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
})
export class HistoricoPage implements OnInit {

  corridas: Corrida[] = []
  confirmarModal = false;
  corridaIdExclusao: string = '';

  constructor(private router: Router, private firestore: AngularFirestore, private afAuth: AngularFireAuth){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/home/tabsCorrida/historico') {
        this.carregarCorridas();
      }
    });
  }

  ngOnInit() {
    this.carregarCorridas();
  }

  carregarCorridas() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.firestore
          .collection('corridas', ref => ref.where('user_id', '==', user.uid).orderBy('data', 'desc').orderBy('hora', 'desc')) // Ordena por data e hora descendente)
          .get()
          .subscribe(
            (snapshot) => {
              this.corridas = [];
              snapshot.forEach(doc => {
                const data: any = doc.data();
                const corrida = {
                  corrida_id: doc.id,
                  dia: data.data,
                  hora: data.hora,
                  distancia: data.distancia,
                  duracao: data.duracao,
                  ritmoMedio: data.ritmoMedio,
                  calorias: data.calorias,
                };
                this.corridas.push(corrida);
              });
            },
            (error) => {
              console.error('Erro ao buscar corridas do usuário:', error);
            }
          );
      }
    });
  }

  async confirmarExclusao(corridaId: string) {
    this.corridaIdExclusao = corridaId;
    this.confirmarModal = true;
  }

  async fecharModal() {
    this.confirmarModal = false;
  }

  async excluirCorrida(){

    this.confirmarModal = false;

    try {
      await this.firestore.collection('corridas').doc(this.corridaIdExclusao).delete();
      // console.log('Corrida excluída com sucesso!');

      this.corridas = this.corridas.filter(c => c.corrida_id !== this.corridaIdExclusao);
      
    } catch (error) {
      console.error('Erro ao excluir corrida:', error);
    }
  }

  IrparaConfig() {
    this.router.navigate(['configuracoes']);
  }

  IrparaCorrida() {
    this.router.navigate(['home/corrida']);
  }

}
