import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription, interval } from 'rxjs';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-confirmar-email',
  templateUrl: './confirmar-email.page.html',
  styleUrls: ['./confirmar-email.page.scss'],
})
export class ConfirmarEmailPage implements OnInit, OnDestroy {

  private emailCheckSubscription: Subscription | null = null;
  isChecking = true;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.startEmailVerificationCheck(user);
      } else {
        this.router.navigate(['/inicial']);
      }
    });
  }

  ngOnDestroy() {
    if (this.emailCheckSubscription) {
      this.emailCheckSubscription.unsubscribe();
    }
  }

  startEmailVerificationCheck(user: firebase.User) {
    this.emailCheckSubscription = interval(5000).subscribe(async () => {
      await user.reload();
      if (user.emailVerified) {
        await this.afAuth.signOut();
        this.router.navigate(['/inicial']);
      }
      this.isChecking = false;
    });
  }

  async resendVerificationEmail() {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      this.presentAlert(
        'E-mail Enviado',
        'Um novo e-mail de verificação foi enviado para o seu endereço de e-mail.'
      );
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
