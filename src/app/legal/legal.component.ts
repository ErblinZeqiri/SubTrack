import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  shieldCheckmarkOutline, documentTextOutline,
  mailOutline, copyOutline,
} from 'ionicons/icons';
import { App as CapApp } from '@capacitor/app';

interface LegalSection {
  title: string;
  text?: string;
  items?: string[];
}

interface LegalDoc {
  icon: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

const CGU: LegalDoc = {
  icon: 'document-text-outline',
  title: "Conditions Générales d'Utilisation",
  updated: '13 juin 2026',
  intro: "Les présentes Conditions Générales d'Utilisation régissent l'utilisation de l'application SubTrack (ci-après « l'Application »), une application mobile permettant aux utilisateurs de suivre, gérer et optimiser leurs abonnements.",
  sections: [
    {
      title: 'Définitions',
      items: [
        "Utilisateur : Toute personne physique utilisant l'Application.",
        'Compte : Espace personnel créé par l\'Utilisateur.',
        "Données d'abonnements : Informations relatives aux abonnements (service, montant, date de renouvellement, etc.).",
      ],
    },
    {
      title: "Accès à l'Application",
      text: "L'Application est disponible gratuitement sur le Google Play Store. Certaines fonctionnalités avancées peuvent être proposées via un abonnement payant.",
    },
    {
      title: 'Inscription et Compte Utilisateur',
      text: "Pour accéder à certaines fonctionnalités, l'Utilisateur doit créer un compte avec une adresse email valide. L'Utilisateur est responsable de la confidentialité de ses identifiants.",
    },
    {
      title: 'Fonctionnalités',
      text: "L'Application permet notamment :",
      items: [
        "Suivi et gestion des abonnements",
        "Notifications de renouvellement",
        "Rapports mensuels de dépenses",
        "Analyse et optimisation des abonnements",
        "Export des données (PDF, CSV, JSON)",
      ],
    },
    {
      title: "Règles d'utilisation",
      text: "L'Utilisateur s'engage à :",
      items: [
        "Utiliser l'Application de manière licite",
        "Ne pas tenter d'extraire ou de scraper les données de l'Application",
        "Ne pas utiliser l'Application pour des activités frauduleuses",
        "Fournir des informations exactes lors de l'inscription",
      ],
    },
    {
      title: 'Propriété Intellectuelle',
      text: "L'Application et son contenu (logos, design, code source) sont la propriété exclusive de l'éditeur. Toute reproduction, distribution ou modification sans autorisation expresse est interdite.",
    },
    {
      title: 'Limitation de responsabilité',
      text: "L'Application est fournie « en l'état ». SubTrack ne peut être tenu responsable des erreurs, omissions, interruptions de service ou pertes financières résultant de l'utilisation de l'Application.",
    },
    {
      title: 'Résiliation',
      text: "L'Utilisateur peut supprimer son compte à tout moment depuis les paramètres de l'Application. SubTrack se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU.",
    },
    {
      title: 'Modifications des CGU',
      text: "SubTrack se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications importantes via l'Application.",
    },
    {
      title: 'Droit applicable',
      text: "Les présentes CGU sont régies par le droit suisse. Tout litige sera soumis aux tribunaux compétents de Genève.",
    },
  ],
};

const PRIVACY: LegalDoc = {
  icon: 'shield-checkmark-outline',
  title: 'Politique de Confidentialité',
  updated: '13 juin 2026',
  intro: 'SubTrack respecte votre vie privée et s\'engage à protéger vos données personnelles conformément au RGPD (Règlement Général sur la Protection des Données).',
  sections: [
    {
      title: 'Données collectées',
      text: 'Nous collectons les données suivantes :',
      items: [
        "Informations de compte : adresse email, nom d'affichage",
        "Données d'abonnements : services utilisés, montants, dates de renouvellement, catégories",
        "Données techniques : identifiant appareil, version de l'OS, token de notification push",
        "Données d'utilisation : fréquence d'utilisation, fonctionnalités consultées",
      ],
    },
    {
      title: 'Finalités du traitement',
      items: [
        'Fournir et améliorer le service',
        'Envoyer des notifications (renouvellements, rapports mensuels)',
        "Générer des rapports et analyses d'abonnements",
        "Améliorer l'expérience utilisateur",
      ],
    },
    {
      title: 'Base légale du traitement',
      items: [
        "Exécution du contrat : pour fournir les fonctionnalités de l'Application",
        "Consentement : pour les notifications push",
        "Intérêt légitime : pour l'amélioration du service",
      ],
    },
    {
      title: 'Partage des données',
      text: "Nous ne vendons aucune donnée personnelle. Les données peuvent être partagées avec :",
      items: [
        "Firebase (Google) : authentification, stockage et notifications push",
        "Fournisseurs d'analytics éventuels (données anonymisées uniquement)",
      ],
    },
    {
      title: 'Durée de conservation',
      text: "Vos données sont conservées tant que votre compte est actif. En cas de suppression du compte, toutes vos données personnelles et d'abonnements sont supprimées de nos serveurs dans un délai de 30 jours.",
    },
    {
      title: 'Vos droits (RGPD)',
      text: 'Conformément au RGPD, vous disposez des droits suivants :',
      items: [
        "Droit d'accès à vos données personnelles",
        "Droit de rectification",
        "Droit à l'effacement (« droit à l'oubli »)",
        "Droit d'opposition au traitement",
        "Droit à la portabilité des données",
        "Droit de retirer votre consentement à tout moment",
      ],
    },
    {
      title: 'Sécurité des données',
      text: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation (chiffrement, accès restreint, authentification sécurisée).",
    },
    {
      title: 'Transferts hors UE',
      text: "Vos données peuvent être traitées par Firebase (Google LLC), dont les serveurs peuvent être situés hors de l'Union Européenne. Google adhère au cadre EU-US Data Privacy Framework garantissant un niveau de protection adéquat.",
    },
    {
      title: 'Mise à jour de la politique',
      text: "Cette politique peut être mise à jour. Vous serez informé de tout changement significatif via l'Application. La date de dernière mise à jour est indiquée en haut de ce document.",
    },
    {
      title: 'Contact',
      text: "Pour exercer vos droits ou pour toute question relative à la protection de vos données, contactez-nous :",
      items: ['Email : subbtrack@gmail.com'],
    },
  ],
};

const DOCS: Record<string, LegalDoc> = { cgu: CGU, privacy: PRIVACY };
const SUPPORT_EMAIL = 'subbtrack@gmail.com';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon,
    CommonModule,
  ],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})

export class LegalComponent implements OnInit {
  doc!: LegalDoc;
  appVersion = '1.0.0';

  private readonly route      = inject(ActivatedRoute);
  private readonly toastCtrl  = inject(ToastController);

  constructor() {
    addIcons({ shieldCheckmarkOutline, documentTextOutline, mailOutline, copyOutline });
  }

  async ngOnInit(): Promise<void> {
    const type = this.route.snapshot.paramMap.get('type') ?? 'cgu';
    this.doc = DOCS[type] ?? CGU;

    try {
      const info = await CapApp.getInfo();
      this.appVersion = info.version;
    } catch {}
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
}
