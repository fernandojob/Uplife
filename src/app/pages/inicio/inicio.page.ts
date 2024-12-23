// inicio.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/compat/app'; // Import necessário para manipular datas Firebase

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  fotoperfil: string = 'https://firebasestorage.googleapis.com/v0/b/uplife-f9bce.appspot.com/o/avatar.jpg?alt=media&token=07e7956f-aed7-4f78-80ff-b41e60e7226a';
  corrida: any = {};
  ingestaoRestante: number = 0;
  proteinasRestantes: number = 0;
  gordurasRestantes: number = 0;
  carboidratosRestantes: number = 0;
  caloriasRestantes: number = 0;  // Nova variável para calorias

  constructor(private router: Router, private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        // Buscar dados do usuário
        this.firestore.collection('users', ref => ref.where('user_id', '==', user.uid)).get().subscribe(snapshot => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data: any = doc.data();

            if (data && data.fotoPerfil) {
              this.fotoperfil = data.fotoPerfil;
            }

            // Calcular ingestão restante
            this.calcularIngestaoRestante(data);
            // Agendar o reset diário
            this.scheduleIngestaoRestanteReset(data);
          } else {
            console.log('Documento do usuário não encontrado');
          }
        }, error => {
          console.error('Erro ao buscar documento do usuário:', error);
        });

        // Buscar última corrida
        this.firestore.collection('corridas', ref => ref.where('user_id', '==', user.uid).orderBy('data', 'desc').limit(1))
          .get()
          .subscribe(snapshot => {
            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              const data: any = doc.data();

              this.corrida = {
                dia: data.data,
                hora: data.hora,
                distancia: data.distancia,
                duracao: data.duracao,
                paceMedio: data.ritmoMedio,
                calorias: data.calorias,
              };
            } else {
              this.corrida = null;
            }
          }, error => {
            console.error('Erro ao buscar última corrida:', error);
          });

        // Buscar dados de alimentação
        this.calcularMacrosRestantes(user.uid);
      } else {
        console.log('Usuário não autenticado');
      }
    }, error => {
      console.error('Erro ao verificar estado de autenticação:', error);
    });
  }

  calcularIngestaoRestante(data: any) {
    // Extrair dados do usuário
    const peso = data.peso; // em kg
    const altura = parseFloat(data.altura.toString().replace('.', '')); // altura em cm, sem ponto
    const dtNascimento = new Date(data.DTnascimento); // Data de nascimento
    const idade = this.calcularIdade(dtNascimento);
    const objetivo = data.objetivo; // objetivo do usuário

    // Calcular IMC
    const alturaMetros = altura / 100; // Converter altura de cm para metros
    const imc = peso / (alturaMetros * alturaMetros);

    // Calcular Peso Ideal
    const pesoIdeal = imc * (alturaMetros * alturaMetros);

    // Calcular Taxa Metabólica Basal (TMB)
    const tmb = 66 + (13.8 * pesoIdeal) + (5 * altura) - (6.8 * idade);

    // Ajustar TMB com base no objetivo do usuário
    if (objetivo === 'ganharPeso') {
      this.ingestaoRestante = tmb + 400;
      this.proteinasRestantes = pesoIdeal * 2.4;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.4;
      this.caloriasRestantes = tmb + 400; // Ajustando calorias
    } else if (objetivo === 'manterPeso') {
      this.ingestaoRestante = tmb;
      this.proteinasRestantes = pesoIdeal * 2.0;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.0;
      this.caloriasRestantes = tmb; // Ajustando calorias
    } else if (objetivo === 'perderPeso') {
      this.ingestaoRestante = tmb - 400;
      this.proteinasRestantes = pesoIdeal * 1.8;
      this.gordurasRestantes = pesoIdeal * 0.6;
      this.carboidratosRestantes = pesoIdeal * 1.8;
      this.caloriasRestantes = tmb - 400; // Ajustando calorias
    } else {
      console.warn('Objetivo desconhecido:', objetivo);
      this.ingestaoRestante = tmb;
      this.proteinasRestantes = pesoIdeal * 2.0;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.0;
      this.caloriasRestantes = tmb; // Ajustando calorias
    }
  }

  calcularMacrosRestantes(userId: string) {
    this.firestore.collection('alimentacao', ref => ref.where('user_id', '==', userId))
      .get()
      .subscribe(snapshot => {
        let totalProteinas = 0;
        let totalGorduras = 0;
        let totalCarboidratos = 0;
        let totalCalorias = 0;  // Nova variável para calorias

        snapshot.forEach(doc => {
          const data: any = doc.data();
          totalProteinas += parseFloat(data.protein_g);
          totalGorduras += parseFloat(data.lipid_g);
          totalCarboidratos += parseFloat(data.carbohydrate_g);
          totalCalorias += parseFloat(data.energy_kcal);  // Adicionando calorias
        });

        // Subtrair os valores consumidos do total recomendado
        this.proteinasRestantes -= totalProteinas;
        this.gordurasRestantes -= totalGorduras;
        this.carboidratosRestantes -= totalCarboidratos;
        this.caloriasRestantes -= totalCalorias;  // Subtraindo calorias
      }, error => {
        console.error('Erro ao buscar dados de alimentação:', error);
      });
  }

  calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  IrparaConfig() {
    this.router.navigate(['configuracoes']);
  }

  irParaCorrida() {
    this.router.navigate(['home/tabsCorrida/corrida']);
  }

  irParaHistorico() {
    this.router.navigate(['home/tabs-alimentacao/historico-alimentacao']);
  }

  irParaHistoricoCorrida() {
    this.router.navigate(['home/tabsCorrida/historico']);
  }

  irParaAdicionar() {
    this.router.navigate(['home/tabs-alimentacao/alimentacao']);
  }

  // Função para resetar ingestão restante
  resetarIngestaoRestante(data: any) {
    // Calcular valores padrão baseados no objetivo do usuário
    const peso = data.peso;
    const altura = parseFloat(data.altura.toString().replace('.', ''));
    const dtNascimento = new Date(data.DTnascimento);
    const idade = this.calcularIdade(dtNascimento);
    const objetivo = data.objetivo;

    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);
    const pesoIdeal = imc * (alturaMetros * alturaMetros);
    const tmb = 66 + (13.8 * pesoIdeal) + (5 * altura) - (6.8 * idade);

    if (objetivo === 'ganharPeso') {
      this.ingestaoRestante = tmb + 400;
      this.proteinasRestantes = pesoIdeal * 2.4;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.4;
      this.caloriasRestantes = tmb + 400;
    } else if (objetivo === 'manterPeso') {
      this.ingestaoRestante = tmb;
      this.proteinasRestantes = pesoIdeal * 2.0;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.0;
      this.caloriasRestantes = tmb;
    } else if (objetivo === 'perderPeso') {
      this.ingestaoRestante = tmb - 400;
      this.proteinasRestantes = pesoIdeal * 1.8;
      this.gordurasRestantes = pesoIdeal * 0.6;
      this.carboidratosRestantes = pesoIdeal * 1.8;
      this.caloriasRestantes = tmb - 400;
    } else {
      this.ingestaoRestante = tmb;
      this.proteinasRestantes = pesoIdeal * 2.0;
      this.gordurasRestantes = pesoIdeal * 1.0;
      this.carboidratosRestantes = pesoIdeal * 2.0;
      this.caloriasRestantes = tmb;
    }
  }

  // Função para agendar o reset diário
  scheduleIngestaoRestanteReset(data: any) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.resetarIngestaoRestante(data);
      this.scheduleIngestaoRestanteReset(data); // Reagendar para o próximo dia
    }, msUntilMidnight);
  }
  
}

