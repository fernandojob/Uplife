import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements OnInit {

  fotoperfil: string = 'https://firebasestorage.googleapis.com/v0/b/uplife-f9bce.appspot.com/o/avatar.jpg?alt=media&token=07e7956f-aed7-4f78-80ff-b41e60e7226a';

  nomeUsuario: string = '';

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(private location: Location, private router: Router, private firestore: AngularFirestore, private afAuth: AngularFireAuth, private storage: AngularFireStorage) { }

  ngOnInit() {
    
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('users', ref => ref.where('user_id', '==', user.uid)).get().subscribe(snapshot => {
          // console.log('Autenticado');
    
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data: any = doc.data();
            // console.log('Documento existe');
    
            if (data && data.nome) {
              this.nomeUsuario = data.nome;
            } 
            
            else {
              console.log('Campo nome não encontrado nos dados do usuário');
            }
    
            if (data && data.fotoPerfil) {
              this.fotoperfil = data.fotoPerfil;
            } 
            
            else {
              console.log('Campo fotoPerfil não encontrado nos dados do usuário');
            }
          } 
          
          else {
            console.log('Documento do usuário não encontrado');
          }

        }, error => {
          console.error('Erro ao buscar documento do usuário:', error);
        });
    
      } 
      
      else {
        // console.log('Usuário não autenticado');
      }

    }, error => {
      console.error('Erro ao verificar estado de autenticação:', error);
    });

  }

  Voltarpagina(){
    this.location.back();
  }

  IrparaConfigCorrida(){
    this.router.navigate(['config-corrida'])
  }

  IrparaEditarConta(){
    this.router.navigate(['editar-conta'])
  }

  alterarFoto() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const filePath = `fotosPerfil/${new Date().getTime()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.fotoperfil = url;
            this.afAuth.currentUser.then(user => {
              if (user) {
                this.firestore.collection('users', ref => ref.where('user_id', '==', user.uid)).get().subscribe(snapshot => {
                  if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    doc.ref.update({ fotoPerfil: url });
                  }
                });
              }
            });
          });
        })
      ).subscribe();
    }
  }

  deletarConta() {
    this.afAuth.currentUser
      .then(user => {
        if (!user) {
          console.error('Nenhum usuário autenticado.');
          return;
        }
  
        // Obtém os dados do usuário do Firestore para verificar se tem o campo 'google: true'
        return this.firestore.collection('users', ref => ref.where('user_id', '==', user.uid))
          .get()
          .toPromise()
          .then(snapshot => {
            if (snapshot && !snapshot.empty) {
              const doc = snapshot.docs[0];
              const data: any = doc.data();
  
              // Verifica se o usuário logou com Google
              let deletePhotoPromise: Promise<void> = Promise.resolve();
              if (data && data.google) {
                // console.log('Usuário logado com Google. Não será excluída a foto de perfil.');
              } else {
                // Exclui a foto de perfil do Firebase Storage, se existir
                if (user.photoURL) {
                  deletePhotoPromise = this.storage.refFromURL(user.photoURL)
                    .delete()
                    .toPromise()
                    .then(() => {
                      // console.log('Foto de perfil excluída com sucesso.');
                    })
                    .catch(error => {
                      console.error('Erro ao excluir foto de perfil:', error);
                      throw error;
                    });
                }
              }
  
              // Exclui os dados das coleções adicionais e outros dados do usuário
              return deletePhotoPromise.then(() => {
                return Promise.all([
                  this.deleteCollectionByUserId('tenis', user.uid),
                  this.deleteCollectionByUserId('tenis-usado', user.uid),
                  this.deleteCollectionByUserId('corridas', user.uid),
                  this.deleteCollectionByUserId('users', user.uid),
                  this.deleteCollectionByUserId('configuracoesCorrida', user.uid),
                  this.deleteCollectionByUserId('alimentacao', user.uid),
                  this.deleteCollectionByUserId('agua', user.uid)
                ])
              }).then(() => {
                // console.log('Dados das coleções adicionais excluídos com sucesso.');
              });
            } else {
              console.log('Documento do usuário não encontrado.');
              return Promise.resolve();
            }
          })
          .then(() => {
            // Exclui conta de autenticação
            return user.delete();
          })
          .then(() => {
            // console.log('Conta de autenticação excluída com sucesso.');
  
            // Redirecionar para a página de login
            this.router.navigate(['/inicial']); // Altere para a página de login
          })
          .catch(error => {
            if (error.code === 'auth/requires-recent-login') {
              // Redirecionar para a página de login
              this.router.navigate(['/login']); // Altere para a página de login
            } else {
              console.error('Erro ao excluir conta de autenticação ou dados:', error);
            }
          });
  
      })
      .catch(error => {
        console.error('Erro ao obter o usuário atual:', error);
      });
  }
  
  // Função auxiliar para excluir documentos de uma coleção com base no user_id
  private deleteCollectionByUserId(collectionName: string, userId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.firestore.collection(collectionName, ref => ref.where('user_id', '==', userId))
        .get()
        .toPromise()
        .then(collectionSnapshot => {
          const deletePromises: Promise<void>[] = [];
          if (collectionSnapshot && !collectionSnapshot.empty) {
            collectionSnapshot.forEach(doc => {
              deletePromises.push(doc.ref.delete());
            });
          }
          // Resolve a Promise com Promise.all mesmo se não houver documentos para excluir
          return Promise.all(deletePromises);
        })
        .then(() => resolve())
        .catch(error => {
          console.error(`Erro ao excluir documentos da coleção ${collectionName}:`, error);
          reject(error);
        });
    });
  }
  
  sairConta(){
    this.afAuth.signOut().then(() => {
      // console.log('Usuário desconectado com sucesso.');
      // Redirecionar para a página de login ou página inicial
      this.router.navigate(['/inicial']); // Altere para a página desejada
    }).catch(error => {
      console.error('Erro ao desconectar o usuário:', error);
    });
  }

}
