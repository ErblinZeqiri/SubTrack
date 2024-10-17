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
      const { category, renewal, userID } = req.body;

      if (!userID) {
        res.status(400).send('Missing userID');
        return;
      }

      try {
        const db = admin.firestore();
        let query: admin.firestore.Query = db
          .collection('subscriptions')
          .where('userID', '==', userID);

        if (category && category !== 'Tout') {
          query = query.where('category', '==', category);
        }

        if (renewal && renewal !== 'Tout') {
          query = query.where('renewal', '==', renewal);
        }

        const snapshot = await query.get();
        const subscriptions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).send(subscriptions);
      } catch (error) {
        console.error('Error filtering subscriptions:', error);
        res.status(500).send('Internal Server Error');
      }
    });
  }
);
