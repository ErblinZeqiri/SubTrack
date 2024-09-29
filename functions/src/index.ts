import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const filterSubscriptions = functions.https.onRequest(async (req, res) => {
    const { category, renewal } = req.body;

    // Logique pour récupérer et filtrer les abonnements depuis Firestore
    try {
      
        const db = admin.firestore();
        let query: admin.firestore.Query = db.collection('subscriptions');

        if (category && category !== 'Tout') {
            query = query.where('category', '==', category);
        }

        if (renewal && renewal !== 'Tout') {
            query = query.where('renewal', '==', renewal);
        }

        const snapshot = await query.get();
        const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).send(subscriptions);
    } catch (error) {
        console.error('Error filtering subscriptions:', error);
        res.status(500).send('Internal Server Error');
    }
});
