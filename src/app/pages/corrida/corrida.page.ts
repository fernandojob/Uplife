import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as L from 'leaflet';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapacitorGeolocation } from '@capacitor/geolocation';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

@Component({
  selector: 'app-corrida',
  templateUrl: './corrida.page.html',
  styleUrls: ['./corrida.page.scss'],
})

export class CorridaPage implements OnInit, OnDestroy {
  
  map: any; 
  userMarker: any;
  watchId: any;
  modalPause = false;
  modalTreino = false;
  confirmarModal = false;
  modalContagemRegressiva = false

  startTime: any;
  pausedTime: number = 0;
  distance: number = 0;
  lastPosition: L.LatLngTuple | null = null;
  intervalId: any;
  isPaused: boolean = false;

  activeTime: number = 0;
  pesoUsuario: number = 0;
  calorias: number = 0;

  userId: string = '';

  tipoVoz: string = 'desativado';
  distanciaComentario: boolean = false;
  duracaoComentario: boolean = false;
  ritmoComentario: boolean = false;
  frequenciaAudio: string = '1km';
  medidor: string = 'nenhum';
  meta: string = '';
  contagemRegressiva: string = ''
  pausaAutomatica: string = ''

  nextDistanceMarker: number = 0;
  nextTimeMarker: number = 0;

  restante: number = 0

  intervalIdVelocidade: any;
  velocidadeAtual: number = 0;
  tempoParado: number = 0;
  limiteTempoParado: number = 10000;
  limiteVelocidade: number = 0.1;
  lastPositionTime: number | null = null;

  constructor(private router: Router, private firestore: AngularFirestore, private afAuth: AngularFireAuth){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/home/tabsCorrida/corrida') {
        this.pegarDados()
      }
    });
  }

  ngOnInit() {
    this.carregarMapa();
    this.pegarDados()
  }

  ngOnDestroy() {
    this.pararTreino();
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  pegarDados(){
    this.afAuth.authState.subscribe((user) => {
      if (user) {

        this.userId = user.uid;

        this.firestore.collection('users', (ref) => ref.where('user_id', '==', user.uid)).get().subscribe((snapshot) => {
              if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data: any = doc.data();

                if (data && data.peso) {
                  this.pesoUsuario = data.peso;
                }
                
              }
            },
            (error) => {
              console.error('Erro ao buscar documento do usuário:', error);
            }
        );

        this.firestore.collection('configuracoesCorrida', (ref) => ref.where('user_id', '==', user.uid)).get().subscribe((snapshot) => {
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data: any = doc.data();

            if (data && data.tipoVoz) {
              this.tipoVoz = data.tipoVoz;
              this.distanciaComentario = data.distanciaComentario,
              this.duracaoComentario = data.duracaoComentario
              this.ritmoComentario = data.ritmoComentario
              this.frequenciaAudio = data.frequenciaAudio;
              this.medidor = data.medidor;
              this.meta = data.meta;
              this.contagemRegressiva = data.contagemRegressiva
              this.pausaAutomatica = data.pausaAutomatica

              if (this.frequenciaAudio.includes('km')) {
                const frequencia = parseInt(this.frequenciaAudio.replace('km', ''));
                this.nextDistanceMarker = frequencia * 1000;
              } 
              
              else if (this.frequenciaAudio.includes('min')) {
                const frequencia = parseInt(this.frequenciaAudio.replace('min', ''));
                this.nextTimeMarker = frequencia * 60 * 1000;
              }
            }
            
          }
        },
        (error) => {
          console.error('Erro ao buscar documento do usuário:', error);
        });

      }
    });
  }

  async carregarMapa() {
    try {
      let position;
  
      if (Capacitor.isNativePlatform()) {
        const hasPermission = await CapacitorGeolocation.requestPermissions();
        if (hasPermission.location === 'granted') {
          position = await CapacitorGeolocation.getCurrentPosition();
        } 
        
        else {
          console.error('Geolocation permission not granted');
          return;
        }
      } 
      
      else {
        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
  
      const pos: L.LatLngTuple = [
        position.coords.latitude,
        position.coords.longitude,
      ];
  
      this.map = L.map('map', {
        center: pos,
        zoom: 18,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(this.map);
  
      this.userMarker = L.circleMarker(pos, {
        radius: 8,
        fillColor: '#4285F4',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(this.map);
  
      setTimeout(() => {
        this.map.invalidateSize();
    }, 100);

      this.posicao();

    } catch (error) {
      console.error('Error getting location', error);
    }
  }
  
  async posicao() {
    try {
      if (Capacitor.isNativePlatform()) {
        this.watchId = CapacitorGeolocation.watchPosition(
          { enableHighAccuracy: true },
          (position, err) => {
            if (err) {
              console.error('Error watching position', err);
              return;
            }
  
            if (this.isPaused || !position) return;
  
            const pos: L.LatLngTuple = [
              position.coords.latitude,
              position.coords.longitude,
            ];
  
            const currentTime = new Date().getTime();
            if (this.lastPosition && this.lastPositionTime) {
              const distanceIncrement = this.map.distance(this.lastPosition, pos);
              const timeIncrement = (currentTime - this.lastPositionTime) / 1000; // Em segundos
              this.velocidadeAtual = distanceIncrement / timeIncrement;
  
              this.distance += distanceIncrement;
            }
  
            this.lastPosition = pos;
            this.lastPositionTime = currentTime;
            
            this.userMarker.setLatLng(pos);
            this.map.setView(pos);
  
            this.verificarComentario();
          }
        );
      } else {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (this.isPaused || !position) return;
  
            const pos: L.LatLngTuple = [
              position.coords.latitude,
              position.coords.longitude,
            ];
  
            const currentTime = new Date().getTime();
            if (this.lastPosition && this.lastPositionTime) {
              const distanceIncrement = this.map.distance(this.lastPosition, pos);
              const timeIncrement = (currentTime - this.lastPositionTime) / 1000; // Em segundos
              this.velocidadeAtual = distanceIncrement / timeIncrement;
  
              this.distance += distanceIncrement;
            }
  
            this.lastPosition = pos;
            this.lastPositionTime = currentTime;
  
            this.userMarker.setLatLng(pos);
            this.map.setView(pos);
  
            this.verificarComentario();
          },
          (err) => {
            console.error('Error watching position', err);
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (error) {
      console.error('Error watching position', error);
    }
  }

  comecarTreino() {
    if (this.contagemRegressiva !== 'desativada' && parseInt(this.contagemRegressiva) > 0) {
      this.iniciarContagemRegressiva(parseInt(this.contagemRegressiva));
    } 
    
    else {
      this.iniciarTreino();
    }
  }

  iniciarContagemRegressiva(segundos: number) {
    this.modalContagemRegressiva = true;
    this.restante = segundos;
    
    const contagemInterval = setInterval(() => {
      if (this.restante > 0) {
        this.restante--;
      } 
      
      else {
        clearInterval(contagemInterval);
        this.modalContagemRegressiva = false;
        this.iniciarTreino();
      }
    }, 1000);
  }

  iniciarTreino() {
    this.falar('Iniciando Treino');
    this.startTime = new Date().getTime();
    this.lastPosition = null;
    this.distance = 0;
    this.activeTime = 0;
    this.pausedTime = 0;
    this.isPaused = false;

    this.modalTreino = true;

    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.activeTime = new Date().getTime() - this.startTime - this.pausedTime;
        this.calorias = Math.round(this.calcularCalorias(
          this.pesoUsuario,
          this.activeTime / 3600000
        ));

        if (this.frequenciaAudio.includes('min')) {
          this.verificarComentario();
        }
      }
    }, 1000);

    this.iniciarMonitoramentoVelocidade();
  }

  iniciarMonitoramentoVelocidade() {
    this.intervalIdVelocidade = setInterval(() => {
      if (this.isPaused || !this.pausaAutomatica) {
        return;
      }
  
      if (this.velocidadeAtual < this.limiteVelocidade) {
        this.tempoParado += 1000; // Incrementa 1 segundo
      } else {
        this.tempoParado = 0; // Reseta o tempo parado se o usuário se mover
      }
  
      if (this.tempoParado >= this.limiteTempoParado) {
        this.pausarAutomaticamente();
      }
    }, 1000);
  }

  calcularRitmoMedio(): string {
    if (this.distance === 0) {
      return "-'--''";
    }

    const elapsedTime = this.activeTime / 1000;
    const minutes = elapsedTime / 60;
    const ritmo = minutes / (this.distance / 1000);
    const minutesPart = Math.floor(ritmo);
    const secondsPart = Math.floor((ritmo - minutesPart) * 60);

    return `${minutesPart}'${secondsPart < 10 ? '0' : ''}${secondsPart}''`;
  }

  calcularCalorias(pesoUsuario: number, tempoAtivoEmHoras: number): number {

    const met = 9.8;
    let resultado = 0

    if(this.distance > 0){
      resultado = pesoUsuario * met * tempoAtivoEmHoras 
    }
    return resultado;
  }

  calcularTempoDecorrido(): string {
    const elapsedTime = this.activeTime / 1000;
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = Math.floor(elapsedTime % 60);
  
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } 
    
    else {
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  }

  pausarTreino() {
    this.falar('Pausando Treino');
    this.isPaused = true;
    this.pausedTime = new Date().getTime() - this.activeTime;
    this.modalTreino = false;
    this.modalPause = true;
  
    if (this.intervalIdVelocidade) {
      clearInterval(this.intervalIdVelocidade);
    }
  }

  retomarTreino() {
    this.falar('Continuando Treino');
    this.modalPause = false;
    this.isPaused = false;
    this.startTime = new Date().getTime() - this.activeTime - this.pausedTime;
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.activeTime = new Date().getTime() - this.startTime - this.pausedTime;
      }
    }, 1000);
    this.modalTreino = true;
  }

  pararTreino() {
    this.falar('Finalizando Treino');
    this.modalPause = false;
    this.confirmarModal = true;
  
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.intervalIdVelocidade) {
      clearInterval(this.intervalIdVelocidade);
    }
  }

  salvarHistorico(escolha: boolean) {
    if (escolha) {
      this.confirmarModal = false;
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const distanciaFormatada = this.distance.toFixed(2);

      const treino = {
        user_id: this.userId,
        distancia: distanciaFormatada,
        duracao: this.calcularTempoDecorrido(),
        calorias: this.calorias,
        ritmoMedio: this.calcularRitmoMedio(),
        data: dateStr,
        hora: timeStr
      };

      this.firestore.collection('corridas').add(treino).then((docRef) => {
        const corrida_id = docRef.id;

        return docRef.update({ corrida_id: corrida_id });
      }).then(() => {
        setTimeout(() => {
          this.router.navigate(['/home/tabsCorrida/historico']);
        }, 300);
      }).catch(error => {
        console.error('Erro ao salvar dados do treino no Firestore:', error);
      });
    } 
    
    else {
      this.confirmarModal = false;
      window.location.reload();
      this.router.navigate(['/home/tabsCorrida']);
    }
  }

  IrparaConfigCorrida() {
    this.router.navigate(['/config-corrida']);
  }

  IrparaTenis() {
    this.router.navigate(['/tenis']);
  }

  recusarTreino() {
    this.confirmarModal = false;
  }

  verificarComentario() {
    if (this.frequenciaAudio.includes('km')) {
      if (this.distance >= this.nextDistanceMarker) {
        this.comentarios();
        const frequencia = parseInt(this.frequenciaAudio.replace('km', ''));
        this.nextDistanceMarker += frequencia * 1000;
      }
    } 
    
    else if (this.frequenciaAudio.includes('min')) {
      const elapsedTime = new Date().getTime() - this.startTime - this.pausedTime;
      if (elapsedTime >= this.nextTimeMarker) {
        this.comentarios();
        const frequencia = parseInt(this.frequenciaAudio.replace('min', ''));
        this.nextTimeMarker += frequencia * 60 * 1000;
      }
    }

    if (this.medidor === 'distancia' && this.distance >= Number(this.meta) * 1000) {
      this.pausarAutomaticamente();
    } 
    
    else if (this.medidor === 'duracao' && (this.activeTime / 60000) >= Number(this.meta)) {
      this.pausarAutomaticamente();
    }

  }

  calcularTempoDecorridoVoz(): string {
    const elapsedTime = this.activeTime / 1000;
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = Math.floor(elapsedTime % 60);
  
    if (hours > 0) {
      return `${hours} horas, ${minutes} minutos e ${seconds} segundos`;
    } 
    
    else {
      return `${minutes} minutos e ${seconds} segundos`;
    }
  }

  comentarios() {
    if (this.distanciaComentario) {
      this.falar(`${(this.distance / 1000).toFixed(2)} quilômetros percorridos`);
    }

    if (this.duracaoComentario) {
      const duracao = this.calcularTempoDecorridoVoz();
      this.falar(`Tempo: ${duracao}`);
    }

    if (this.ritmoComentario) {
      this.falar(`Ritmo médio: ${this.calcularRitmoMedio()}`);
    }
  }

  async falar(fala: string) {
    if (this.tipoVoz === 'desativado') {
      return;
    }

    if (Capacitor.isNativePlatform()) {
      await TextToSpeech.speak({
        text: fala,
        lang: 'pt-BR',
        rate: 1.0
      });
    } 
    
    else {
      const utterance = new SpeechSynthesisUtterance(fala);
      utterance.lang = 'pt-BR';
      speechSynthesis.speak(utterance);
    }
  }

  pausarAutomaticamente() {
    this.falar('Pausa automática acionada');
    this.pausarTreino();
  }

}
