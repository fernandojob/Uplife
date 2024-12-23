import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

interface Alimento {
  id: string;
  descricao: string;
  carboidrato_g: number;
  energia_kcal: number;
  gordura_g: number;
  proteina_g: number;
  tipoRefeicao: string;
  dataHora: Date;
}

interface AlimentosPorData {
  [key: string]: { data: Date, alimentosPorRefeicao: { [key: string]: Alimento[] } };
}

interface ConsumoAgua {
  quantidade_ml: number;
  dataHora: Date;
}

interface AguaPorData {
  [key: string]: { data: Date, consumo: ConsumoAgua[] };
}

@Component({
  selector: 'app-historico-alimentacao',
  templateUrl: './historico-alimentacao.page.html',
  styleUrls: ['./historico-alimentacao.page.scss'],
})
export class HistoricoAlimentacaoPage implements OnInit {

  alimentos: Alimento[] = [];
  alimentosPorData: AlimentosPorData = {};
  datas: string[] = [];

  aguaPorData: AguaPorData = {};
  datasAgua: string[] = [];

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // Buscar dados de alimentação
        this.firestore.collection('alimentacao', ref => ref.where('user_id', '==', user.uid))
          .get()
          .subscribe(
            (snapshot) => {
              this.alimentos = [];
              snapshot.forEach(doc => {
                const data: any = doc.data();

                const alimento: Alimento = {
                  id: doc.id,
                  descricao: data.description,
                  carboidrato_g: parseFloat(data.carbohydrate_g),
                  energia_kcal: parseFloat(data.energy_kcal),
                  gordura_g: parseFloat(data.lipid_g),
                  proteina_g: parseFloat(data.protein_g),
                  tipoRefeicao: data.tipoRefeicao,
                  dataHora: (data.dataHora as firebase.firestore.Timestamp).toDate()
                };

                this.alimentos.push(alimento);
              });

              this.organizarAlimentosPorData();
              // console.log('Alimentos organizados por data:', this.alimentosPorData);
            },
            (error) => {
              console.error('Erro ao buscar alimentos do usuário:', error);
            }
          );

        // Buscar dados de consumo de água
        this.firestore.collection('agua', ref => ref.where('user_id', '==', user.uid))
          .get()
          .subscribe(
            (snapshot) => {
              const consumosAgua: ConsumoAgua[] = [];
              snapshot.forEach(doc => {
                const data: any = doc.data();

                const consumo: ConsumoAgua = {
                  quantidade_ml: data.quantidade_ml,
                  dataHora: (data.dataHora as firebase.firestore.Timestamp).toDate()
                };

                consumosAgua.push(consumo);
              });

              this.organizarAguaPorData(consumosAgua);
              // console.log('Consumo de água organizado por data:', this.aguaPorData);
            },
            (error) => {
              console.error('Erro ao buscar consumo de água do usuário:', error);
            }
          );
      }
    });
  }

  organizarAlimentosPorData() {
    this.alimentosPorData = {};

    this.alimentos.forEach(alimento => {
      const dataString = alimento.dataHora.toISOString().split('T')[0]; // Converte a data para uma string no formato 'yyyy-mm-dd'
      
      if (!this.alimentosPorData[dataString]) {
        this.alimentosPorData[dataString] = { data: alimento.dataHora, alimentosPorRefeicao: { 'Café Da Manhã': [], 'Almoço': [], 'Jantar': [], 'Lanches/Outros': [] } };
      }

      if (this.alimentosPorData[dataString].alimentosPorRefeicao[alimento.tipoRefeicao]) {
        this.alimentosPorData[dataString].alimentosPorRefeicao[alimento.tipoRefeicao].push(alimento);
      } else {
        console.warn(`Tipo de refeição desconhecido: ${alimento.tipoRefeicao}`);
      }
    });

    // Atualiza a lista de datas e ordena em ordem decrescente
    this.datas = Object.keys(this.alimentosPorData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  organizarAguaPorData(consumos: ConsumoAgua[]) {
    this.aguaPorData = {};

    consumos.forEach(consumo => {
      const dataString = consumo.dataHora.toISOString().split('T')[0]; // Converte a data para uma string no formato 'yyyy-mm-dd'
      
      if (!this.aguaPorData[dataString]) {
        this.aguaPorData[dataString] = { data: consumo.dataHora, consumo: [] };
      }

      this.aguaPorData[dataString].consumo.push(consumo);
    });

    // Atualiza a lista de datas para o consumo de água e ordena em ordem decrescente
    this.datasAgua = Object.keys(this.aguaPorData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  getIconForRefeicao(tipoRefeicao: string): { name: string, cssClass: string } {
    switch (tipoRefeicao) {
      case 'Café Da Manhã': return { name: 'cafe', cssClass: 'cafe' };
      case 'Almoço': return { name: 'sunny', cssClass: 'sunny' };
      case 'Jantar': return { name: 'moon', cssClass: 'moon' };
      case 'Lanches/Outros': return { name: 'nutrition', cssClass: 'nutrition' };
      default: return { name: 'restaurant', cssClass: 'default' };
    }
  }

  getFormattedId(tipoRefeicao: string): string {
    return tipoRefeicao.toLowerCase().replace(/\//g, '');
  }

  getTotalAgua(consumos: ConsumoAgua[]): number {
    return consumos.reduce((total, consumo) => total + consumo.quantidade_ml, 0);
  }
}
