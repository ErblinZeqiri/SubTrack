/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.checkExpirationAndSendNotification = functions.pubsub
  .schedule('every day 13:00')
  .timeZone('Europe/Zurich') // Remplacez 'Your/Timezone' par le fuseau horaire souhaité
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On met l'heure à 00:00:00 pour ignorer l'heure
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    try {
      // Chercher tous les abonnements qui expirent dans 7 jours
      const subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('nextPaymentDate', '>=', today.toISOString().split('T')[0]) // Assurez-vous que la date est au format 'YYYY-MM-DD'
        .where(
          'nextPaymentDate',
          '<',
          sevenDaysFromNow.toISOString().split('T')[0]
        )
        .get();

      const promises: Promise<any>[] = [];

      for (const doc of subscriptionsSnapshot.docs) {
        const subscription = doc.data();
        const userId = subscription.userID;

        // Chercher le deviceToken de l'utilisateur associé à cet abonnement
        const userSnapshot = await db.collection('users').doc(userId).get();
        const user = userSnapshot.data();

        if (user && user.deviceToken) {
          const message = {
            notification: {
              title: 'Abonnement expirant bientôt',
              body: `Votre abonnement avec ${subscription.companyName} expirera dans 7 jours !`,
            },
            token: user.deviceToken, // Le token utilisateur doit être stocké dans le document 'users'
          };

          // Envoyer la notification pour chaque abonnement trouvé
          const promise = admin
            .messaging()
            .send(message)
            .then((response) => {
              console.log('Notification envoyée avec succès:', response);
            })
            .catch((error) => {
              console.error(
                "Erreur lors de l'envoi de la notification:",
                error
              );
            });

          promises.push(promise);
        } else {
          console.error(
            `Aucun deviceToken trouvé pour l'utilisateur ${userId}`
          );
        }
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error);
    }
  });
