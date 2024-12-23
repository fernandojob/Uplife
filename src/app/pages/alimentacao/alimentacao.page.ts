import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';
import { TextFieldTypes } from '@ionic/core';

@Component({
  selector: 'app-alimentacao',
  templateUrl: './alimentacao.page.html',
  styleUrls: ['./alimentacao.page.scss'],
})
export class AlimentacaoPage implements OnInit {
  quantidadeAguaRecomendada: number = 0;
  quantidadeAguaConsumida: number = 0;
  DetalheAlimento = false;
  alimento: any;
  descricaoAlimento: string;
  alimentos: any[] = [];
  alertInputs = [
    {
      name: 'alimento',
      type: 'text' as TextFieldTypes,
      placeholder: 'Alimento'
    },
    {
      name: 'gramas',
      type: 'number' as TextFieldTypes,
      placeholder: 'Gramas',
      required: true
    }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    public alertController: AlertController
  ) {
    this.descricaoAlimento = '';
    this.carregarAlimentos();
    this.carregarQuantidadeAguaRecomendada();
  }

  async ngOnInit() {
    // Verificar se os dados devem ser limpos no início do dia
    this.verificarFimDoDia();

    // Carregar alimentos do Local Storage ao iniciar a página
    this.carregarAlimentosDoLocalStorage();
  }

  async carregarQuantidadeAguaRecomendada() {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const userId = user.uid;
  
        // Busca o documento do usuário no Firestore
        const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
  
        // Verifica se o documento existe antes de acessar seus dados
        if (userDoc && userDoc.exists) {
          const userData = userDoc.data() as any; // Define o tipo de userData como any
          const pesoUsuario = userData.peso || 0; // Acessa o campo peso
  
          // Calcula a quantidade recomendada de água (35 ml por kg de peso)
          this.quantidadeAguaRecomendada = pesoUsuario * 35;
        } else {
          console.error('Documento do usuário não encontrado ou não existe no Firestore.');
        }
      } else {
        console.error('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }
  

  carregarAlimentos() {
    this.http.get('assets/json/TACO.json').subscribe((data: any) => {
      this.alimentos = data;
    });
  }

  pesquisarAlimento(descricao: string) {
    this.http.get(`http://localhost:3000/${descricao}`).subscribe(data => {
      this.alimento = data;
    });
  }

  abrirDetalheAlimento(status: boolean) {
    this.DetalheAlimento = true;
  }

  async abrirAlerta(mealType: string) {
    const alert = await this.alertController.create({
      header: 'Insira o alimento e a quantidade',
      inputs: this.alertInputs,
      buttons: [
        {
          text: 'OK',
          handler: (data) => {
            const alimento = this.alimentos.find(a => a.description.toLowerCase() === data.alimento.toLowerCase());
            if (alimento && data.gramas) {
              const gramas = parseFloat(data.gramas);
              const fator = gramas / 100;
              const calorias = (alimento.energy_kcal * fator).toFixed(2);
              const proteina = (alimento.protein_g * fator).toFixed(2);
              const gordura = (alimento.lipid_g * fator).toFixed(2);
              const carboidratos = (alimento.carbohydrate_g * fator).toFixed(2);
  
              // Adiciona os valores calculados ao acordeão
              this.adicionarAlimentoAcordeao({
                ...alimento,
                energy_kcal: calorias,
                protein_g: proteina,
                lipid_g: gordura,
                carbohydrate_g: carboidratos,
                gramas: data.gramas
              }, mealType);
            } else {
              console.warn('Alimento não encontrado ou quantidade em gramas não informada!');
            }
          }
        }
      ]
    });

    // Adiciona um event listener para o input do alert para as sugestões
    alert.addEventListener('didPresent', () => {
      const inputField: any = document.querySelector('ion-alert input');
      if (inputField) {
        inputField.addEventListener('input', (event: any) => {
          this.filtrarSugestoes(event.target.value);
        });
      }
    });

    await alert.present();
  }

  filtrarSugestoes(inputValue: string) {
    const inputField = document.querySelector('ion-alert input');
    const sugestões = this.alimentos
      .filter(a => a.description.toLowerCase().includes(inputValue.toLowerCase()))
      .map(a => a.description);

    if (sugestões.length > 0 && inputField) {
      const dataList = document.createElement('datalist');
      dataList.id = 'sugestoes';
      sugestões.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        dataList.appendChild(option);
      });

      inputField.setAttribute('list', 'sugestoes');
      document.body.appendChild(dataList);
    }
  }

  async adicionarAlimentoAcordeao(alimento: any, mealType: string) {
    // Constrói o ID do acordeão com base no tipo da refeição
    const acordeaoId = `content-${mealType.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9\s]/g, '')  // Remove caracteres especiais
      .replace(/\s+/g, '-')         // Substitui espaços por traços
      .replace(/-+/g, '-')          // Remove traços consecutivos
      .trim()}`;                    // Remove traços no início ou final
  
    // Log para verificar o ID gerado
    console.log(`Procurando por acordeão com ID: ${acordeaoId}`);
  
    // Obtém o elemento de conteúdo do acordeão
    const acordeaoContent = document.getElementById(acordeaoId);
  
    // Verifica se o elemento de conteúdo do acordeão existe
    if (acordeaoContent) {
      // Cria um novo elemento de parágrafo para adicionar ao acordeão
      const pElement = document.createElement('p');
      pElement.innerHTML = `
        <strong>${alimento.description}</strong><br>
        Calorias: ${alimento.energy_kcal} kcal<br>
        Proteína: ${alimento.protein_g} g<br>
        Gordura: ${alimento.lipid_g} g<br>
        Carboidratos: ${alimento.carbohydrate_g} g<br>
        Quantidade: ${alimento.gramas} g
      `;
      // Adiciona o novo elemento ao conteúdo do acordeão
      acordeaoContent.appendChild(pElement);

      // Salva no Firebase
      try {
        const user = await this.afAuth.currentUser;
        if (user) {
          const userId = user.uid;

          // Cria um novo documento no Firestore
          await this.firestore.collection('alimentacao').add({
              user_id: userId,
              tipoRefeicao: mealType,
              description: alimento.description,
              energy_kcal: alimento.energy_kcal,
              protein_g: alimento.protein_g,
              lipid_g: alimento.lipid_g,
              carbohydrate_g: alimento.carbohydrate_g,
              gramas: alimento.gramas,
              dataHora: new Date()
          });

          console.log('Alimento salvo no Firebase!');
        } else {
          console.error("Usuário não autenticado");
        }
      } catch (error) {
        console.error("Erro ao salvar os dados: ", error);
      }

      // Salva no Local Storage
      this.salvarNoLocalStorage(alimento, mealType);
    } else {
      console.warn(`Elemento de acordeão não encontrado para ${mealType}`);
    }
  }

  salvarNoLocalStorage(alimento: any, mealType: string) {
    const currentDay = new Date().toISOString().split('T')[0];
    const key = `alimentacao_${currentDay}`;

    let storedData = localStorage.getItem(key);
    let data = storedData ? JSON.parse(storedData) : {};

    if (!data[mealType]) {
      data[mealType] = [];
    }
    
    data[mealType].push(alimento);
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Método carregarAlimentosDoLocalStorage atualizado
carregarAlimentosDoLocalStorage() {
  const currentDay = new Date().toISOString().split('T')[0];
  const keyAlimentacao = `alimentacao_${currentDay}`;
  const keyAgua = `agua_${currentDay}`;

  const storedDataAlimentacao = localStorage.getItem(keyAlimentacao);
  const storedDataAgua = localStorage.getItem(keyAgua);

  if (storedDataAlimentacao) {
    const dataAlimentacao = JSON.parse(storedDataAlimentacao);
    for (let mealType in dataAlimentacao) {
      if (dataAlimentacao.hasOwnProperty(mealType)) {
        dataAlimentacao[mealType].forEach((alimento: any) => {
          this.adicionarAlimentoLocalmente(alimento, mealType);
        });
      }
    }
  }

  if (storedDataAgua) {
    const dataAgua = JSON.parse(storedDataAgua);
    let quantidadeTotalAgua = 0;
    if (dataAgua['consumo_agua']) {
      dataAgua['consumo_agua'].forEach((item: any) => {
        quantidadeTotalAgua += item.quantidade_ml;
      });
    }
    this.quantidadeAguaConsumida = quantidadeTotalAgua;

    // Atualiza a interface com a quantidade de água consumida
    const quantidadeAguaElement = document.getElementById('quantidadeAgua');
    if (quantidadeAguaElement) {
      quantidadeAguaElement.innerHTML = `${this.quantidadeAguaConsumida} ml de 2500 ml`;
    }
  }
}


  adicionarAlimentoLocalmente(alimento: any, mealType: string) {
    const acordeaoId = `content-${mealType.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()}`;
    
    const acordeaoContent = document.getElementById(acordeaoId);

    if (acordeaoContent) {
      const pElement = document.createElement('p');
      pElement.innerHTML = `
        <strong>${alimento.description}</strong><br>
        Calorias: ${alimento.energy_kcal} kcal<br>
        Proteína: ${alimento.protein_g} g<br>
        Gordura: ${alimento.lipid_g} g<br>
        Carboidratos: ${alimento.carbohydrate_g} g<br>
        Quantidade: ${alimento.gramas} g
      `;
      acordeaoContent.appendChild(pElement);
    } else {
      console.warn(`Elemento de acordeão não encontrado para ${mealType}`);
    }
  }

  async adicionarAgua(ml: number) {
    try {
      // Atualiza a quantidade consumida de água
      this.quantidadeAguaConsumida += ml;

      // Salva no localStorage
      const currentDay = new Date().toISOString().split('T')[0];
      const key = `agua_${currentDay}`;

      let storedData = localStorage.getItem(key);
      let data = storedData ? JSON.parse(storedData) : {};

      if (!data['consumo_agua']) {
        data['consumo_agua'] = [];
      }

      data['consumo_agua'].push({
        quantidade_ml: ml,
        dataHora: new Date()
      });

      localStorage.setItem(key, JSON.stringify(data));

      console.log('Quantidade de água consumida salva no localStorage!');

      // Salva no Firebase
      await this.salvarNoFirebase(ml);

    } catch (error) {
      console.error("Erro ao salvar os dados de água: ", error);
    }
  }

  async salvarNoFirebase(ml: number) {
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const userId = user.uid;

        // Salva no Firestore
        await this.firestore.collection('agua').add({
          user_id: userId,
          quantidade_ml: ml,
          dataHora: new Date()
        });

        console.log('Água consumida salva no Firebase!');
      } else {
        console.error("Usuário não autenticado");
      }
    } catch (error) {
      console.error("Erro ao salvar os dados de água no Firebase: ", error);
    }
  }

  limparDadosDoLocalStorage() {
    const currentDay = new Date().toISOString().split('T')[0];
    const key = `alimentacao_${currentDay}`;

    localStorage.removeItem(key);
  }

  verificarFimDoDia() {
    // Recupera a data atual
    const currentDay = new Date().toISOString().split('T')[0];

    // Verifica todas as chaves do Local Storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Se a chave contém "alimentacao_" e não é do dia atual, remove-a
      if (key && key.startsWith('alimentacao_') && key !== `alimentacao_${currentDay}`) {
        localStorage.removeItem(key);
      }
    }

    // Verifica todas as chaves do Local Storage para água
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Se a chave contém "agua_" e não é do dia atual, remove-a
      if (key && key.startsWith('agua_') && key !== `agua_${currentDay}`) {
        localStorage.removeItem(key);
      }
    }
  }
}
