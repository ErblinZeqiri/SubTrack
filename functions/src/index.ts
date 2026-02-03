import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

// Configurer CORS
const corsHandler = cors({ origin: true });

export const filterSubscriptions = functions.https.onRequest(
  async (req, res): Promise<void> => {
    // Utiliser cors pour gérer les requêtes cross-origin
    corsHandler(req, res, async () => {
      const { categories, renewals, userID } = req.body;

      if (!userID) {
        res.status(400).send('Missing userID');
        return;
      }

      try {
        const db = admin.firestore();
        let query: admin.firestore.Query = db
          .collection('subscriptions')
          .where('userID', '==', userID);

        // Si aucun filtre n'est appliqué, retourner tous les abonnements
        if ((!categories || categories.length === 0) && (!renewals || renewals.length === 0)) {
          const snapshot = await query.get();
          const subscriptions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.status(200).send(subscriptions);
          return;
        }

        // Récupérer tous les documents et filtrer côté serveur pour supporter multiple sélection
        const snapshot = await query.get();
        let subscriptions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtrer par catégories si spécifié
        if (categories && categories.length > 0) {
          subscriptions = subscriptions.filter((sub: any) => 
            categories.includes(sub.category)
          );
        }

        // Filtrer par renouvellements si spécifié
        if (renewals && renewals.length > 0) {
          subscriptions = subscriptions.filter((sub: any) => 
            renewals.includes(sub.renewal)
          );
        }

        res.status(200).send(subscriptions);
      } catch (error) {
        console.error('Error filtering subscriptions:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }
);
