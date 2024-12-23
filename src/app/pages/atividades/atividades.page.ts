import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-atividades',
  templateUrl: './atividades.page.html',
  styleUrls: ['./atividades.page.scss'],
})
export class AtividadesPage implements OnInit {
  atividade: any[] = []; // Lista de atividades
  gruposDeExercicios: any[] = []; // Grupos de exercícios agrupados por target

  fotoperfil: string = 'https://firebasestorage.googleapis.com/v0/b/uplife-f9bce.appspot.com/o/avatar.jpg?alt=media&token=07e7956f-aed7-4f78-80ff-b41e60e7226a';

  DetalheExercicio = false; // Estado do modal
  exercicioSelecionado: any = null; // Exercício atualmente selecionado

  constructor(private router: Router, private http: HttpClient, private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  ngOnInit() {
    this.http.get<any[]>('assets/json/atividades.json').subscribe(data => {
      this.atividade = data;
      this.agrupamentoExerciciosPorTarget();
    });

    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        this.firestore.collection('users', ref => ref.where('user_id', '==', user.uid)).get().subscribe(snapshot => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data: any = doc.data();
            if (data && data.fotoPerfil) {
              this.fotoperfil = data.fotoPerfil;
            }
          }
        }, error => {
          console.error('Erro ao buscar documento do usuário:', error);
        });
      }
    }, error => {
      console.error('Erro ao verificar estado de autenticação:', error);
    });
  }

  agrupamentoExerciciosPorTarget() {
    const agrupamento = this.atividade.reduce((grupos, exercicio) => {
      const target = exercicio.target.toLowerCase();
      if (!grupos[target]) {
        grupos[target] = [];
      }
      grupos[target].push(exercicio);
      return grupos;
    }, {});

    this.gruposDeExercicios = Object.keys(agrupamento).map(target => ({
      target,
      exercicios: agrupamento[target]
    }));
  }

  abrirDetalheExercicio(exercicio: any) {
    this.exercicioSelecionado = exercicio; // Define o exercício selecionado
    this.DetalheExercicio = true; // Abre o modal
  }

  fecharModal() {
    this.DetalheExercicio = false; // Fecha o modal
    this.exercicioSelecionado = null; // Reseta o exercício selecionado
  }

  IrparaConfig() {
    this.router.navigate(['configuracoes']);
  }
}
