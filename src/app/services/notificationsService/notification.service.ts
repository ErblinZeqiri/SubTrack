import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotifications,
  PushNotificationSchema,
  Token,
} from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private deviceToken: string | null = null;

  constructor() {
    this.registerPushNotifications();
  }

  private async registerPushNotifications() {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
    } else {
      console.error('Permission refusée pour les notifications push');
      return;
    }

    // Écouter les notifications reçues
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notification reçue: ', notification);
      }
    );

    // Écouter les actions effectuées sur les notifications
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Action sur la notification effectuée: ', notification);
      }
    );

    // Écouter le token d'enregistrement
    PushNotifications.addListener('registration', (token: Token) => {
      console.log("Token d'enregistrement: ", token.value);
      // Ici, tu peux envoyer le token à ton backend pour l'enregistrer
      this.deviceToken = token.value;
    });

    // Écouter les erreurs d'enregistrement
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error("Erreur d'enregistrement: ", error);
    });
  }

  getDeviceToken(): string | null {
    return this.deviceToken;
  }
}
