import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonButton,
  IonSelect, IonSelectOption, IonTextarea, IonItem,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  mailOutline, bugOutline, sparklesOutline, chevronForwardOutline,
  sendOutline, copyOutline, chevronDownOutline, chevronUpOutline,
} from 'ionicons/icons';
import { App as CapApp } from '@capacitor/app';
import { AuthService } from '../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

const SUPPORT_EMAIL = 'subbtrack@gmail.com';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon, IonButton,
    IonSelect, IonSelectOption, IonTextarea, IonItem,
    CommonModule, FormsModule,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  subject = 'Question';
  message = '';
  userEmail = '';
  appVersion = '1.0.0';
  openFaqIndex: number | null = null;

  readonly subjectOptions = [
    { value: 'Question',       label: '❓ Question générale' },
    { value: 'Bug',            label: '🐛 Signaler un bug' },
    { value: 'Suggestion',     label: '✨ Proposer une fonctionnalité' },
    { value: 'Notifications',  label: '🔔 Problème avec les notifications' },
    { value: 'Autre',          label: '💬 Autre' },
  ];

  readonly faq = [
    {
      q: 'Comment ajouter un abonnement ?',
      a: "Appuyez sur le bouton « + » en bas de l'écran principal, puis remplissez les informations de votre abonnement.",
    },
    {
      q: 'Comment activer les notifications de renouvellement ?',
      a: "Allez dans Compte → Notifications et activez les « Rappels de renouvellement ». Vous pouvez choisir 1, 3 ou 7 jours avant.",
    },
    {
      q: 'Comment exporter mes données ?',
      a: "Dans l'onglet Rapports, appuyez sur l'icône d'export. Vous pouvez exporter en PDF, CSV ou JSON.",
    },
    {
      q: 'Comment supprimer mon compte ?',
      a: "Allez dans Compte → Zone dangereuse → Supprimer mon compte. Cette action est irréversible et supprime toutes vos données.",
    },
    {
      q: "Les notifications ne s'affichent pas sur mon téléphone.",
      a: "Vérifiez que les notifications sont autorisées dans Paramètres Android → Applications → SubTrack → Notifications. Ensuite, ouvrez l'app et allez dans Compte → Notifications pour réactiver.",
    },
    {
      q: 'Comment exporter mes données en PDF ?',
      a: "Dans l'onglet Rapports, sélectionnez un mois puis appuyez sur l'icône d'export en haut à droite. Choisissez le format PDF et appuyez sur « Exporter mes données ». Le fichier est enregistré dans votre dossier Téléchargements.",
    },
    {
      q: 'Comment changer la devise affichée ?',
      a: "Allez dans Compte → Devise. Vous pouvez choisir parmi plus de 30 devises (CHF, EUR, USD, etc.). La devise est appliquée à tous les montants de l'application.",
    },
    {
      q: 'Mes données sont-elles sécurisées ?',
      a: "Oui. Vos données sont stockées de manière sécurisée sur Firebase (Google) et protégées par votre compte. Nous ne vendons ni ne partageons vos données personnelles. Consultez notre Politique de confidentialité pour plus de détails.",
    },
    {
      q: 'Peut-on utiliser SubTrack sur plusieurs appareils ?',
      a: "Oui. Connectez-vous avec le même compte sur n'importe quel appareil Android. Vos abonnements sont synchronisés automatiquement via votre compte.",
    },
  ];

  private readonly auth     = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    addIcons({
      mailOutline, bugOutline, sparklesOutline, chevronForwardOutline,
      sendOutline, copyOutline, chevronDownOutline, chevronUpOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    const user = await firstValueFrom(this.auth.getCurrentUser());
    if (user?.email) this.userEmail = user.email;

    try {
      const info = await CapApp.getInfo();
      this.appVersion = info.version;
    } catch {}
  }

  async send(): Promise<void> {
    if (!this.message.trim()) {
      const toast = await this.toastCtrl.create({
        message: "Veuillez écrire un message avant d'envoyer.",
        duration: 2500,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const sub  = encodeURIComponent(`[${this.subject}] SubTrack`);
    const body = encodeURIComponent(
      `${this.message}\n\n---\nEmail : ${this.userEmail}\nVersion : ${this.appVersion}`,
    );
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${sub}&body=${body}`, '_system');
  }

  openQuick(type: string): void {
    const sub = encodeURIComponent(`[${type}] SubTrack`);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${sub}`, '_system');
  }

  async copyEmail(): Promise<void> {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    const toast = await this.toastCtrl.create({
      message: 'Email copié !',
      duration: 1800,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  toggleFaq(i: number): void {
    this.openFaqIndex = this.openFaqIndex === i ? null : i;
  }
}
