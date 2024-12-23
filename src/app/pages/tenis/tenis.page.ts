import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tenis',
  templateUrl: './tenis.page.html',
  styleUrls: ['./tenis.page.scss'],
})
export class TenisPage implements OnInit {
  formModal = false;
  editarModal = false;
  confirmarModal = false;
  tenisIdExclusao: string = '';
  tenisForm: FormGroup;
  tenisList: Observable<any[]> | null = null;
  currentTenisId: string | null = null;
  selectedTenisId: string | null = null;

  constructor(private location: Location, private formBuilder: FormBuilder, private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.tenisForm = this.formBuilder.group({
      nomeTenis: ['', Validators.required],
      meta: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.tenisList = this.firestore.collection('tenis', ref => ref.where('user_id', '==', user.uid)).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );
        this.loadSelectedTenis(user.uid);  // Carregar o tênis selecionado
      }
    });
  }

  async loadSelectedTenis(userId: string) {
    const tenisUsadoRef = this.firestore.collection('tenis-usado', ref => ref.where('user_id', '==', userId));
    try {
      const snapshot = await tenisUsadoRef.get().toPromise();
      if (snapshot && !snapshot.empty) {
        const tenisUsado: any = snapshot.docs[0].data();
        this.selectedTenisId = tenisUsado.tenis_id;
      } else {
        this.selectedTenisId = null;
      }
    } catch (error) {
      console.error("Erro ao carregar o tênis usado:", error);
    }
  }

  adicionarTenis() {
    this.formModal = true;
  }

  async salvar() {
    if (this.tenisForm.valid) {
      const { nomeTenis, meta } = this.tenisForm.value;
      try {
        const user = await this.afAuth.currentUser;
        if (user) {
          const userId = user.uid;
          const tenisId = this.firestore.createId();
          await this.firestore.collection('tenis').doc(tenisId).set({
            tenis_id: tenisId,
            user_id: userId,
            distancia: "0",
            foto: "https://firebasestorage.googleapis.com/v0/b/uplife-f9bce.appspot.com/o/Tenis.png?alt=media&token=ea2ebc57-fdf7-45c5-b652-1e1a1f311b79",
            nomeTenis: nomeTenis,
            meta: meta
          });
          this.formModal = false;
          this.tenisForm.reset();
        } else {
          console.error("Usuário não autenticado");
        }
      } catch (error) {
        console.error("Erro ao salvar os dados: ", error);
      }
    } else {
      this.tenisForm.markAllAsTouched();
    }
  }

  editar(tenis: any) {
    this.currentTenisId = tenis.tenis_id;
    this.tenisForm.setValue({
      nomeTenis: tenis.nomeTenis,
      meta: tenis.meta
    });
    this.editarModal = true;
  }

  async atualizar() {
    if (this.tenisForm.valid && this.currentTenisId) {
      const { nomeTenis, meta } = this.tenisForm.value;
      try {
        await this.firestore.collection('tenis').doc(this.currentTenisId).update({
          nomeTenis: nomeTenis,
          meta: meta
        });
        this.editarModal = false;
        this.tenisForm.reset();
        this.currentTenisId = null;
      } catch (error) {
        console.error("Erro ao atualizar os dados: ", error);
      }
    } else {
      this.tenisForm.markAllAsTouched();
    }
  }

  confirmar(tenisId: string) {
    this.confirmarModal = true;
    this.tenisIdExclusao = tenisId;
  }

  async excluirTenis() {
    this.confirmarModal = false;
    try {
      await this.firestore.collection('tenis').doc(this.tenisIdExclusao).delete();
      // console.log("Tênis excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir o tênis:", error);
    }
  }

  async usar(IDtenis: string) {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const tenisUsadoRef = this.firestore.collection('tenis-usado', ref => ref.where('user_id', '==', userId));
      try {
        const snapshot = await tenisUsadoRef.get().toPromise();
        if (snapshot) {
          if (!snapshot.empty) {
            snapshot.forEach(doc => {
              doc.ref.delete();
            });
          }
          // Adiciona o novo documento com o ID do tênis usado
          if (IDtenis !== 'null') {
            await this.firestore.collection('tenis-usado').add({
              tenis_id: IDtenis,
              user_id: userId,
            });
            this.selectedTenisId = IDtenis;  // Atualiza o tênis selecionado
          } else {
            this.selectedTenisId = null;  // Define como null se "Nenhum tênis" for selecionado
          }
        } else {
          console.error("O snapshot não foi obtido corretamente.");
        }
      } catch (error) {
        console.error("Erro ao obter o snapshot:", error);
      }
    } else {
      console.error("Usuário não autenticado");
    }
  }

  fecharModal() {
    this.formModal = false;
    this.editarModal = false;
    this.confirmarModal = false;
    this.currentTenisId = null;
    this.tenisForm.reset();
  }

  Voltarpagina() {
    this.location.back();
  }
}
