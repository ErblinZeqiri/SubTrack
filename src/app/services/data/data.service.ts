import { Injectable, OnDestroy } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  docData,
  documentId,
  Firestore,
  query,
  QueryConstraint,
  where,
  onSnapshot,
  Unsubscribe,
} from '@angular/fire/firestore';
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class DataService implements OnDestroy {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();

  // Stocke la référence d'unsubscribe de onSnapshot pour éviter les memory leaks
  private unsubscribeSnapshot: Unsubscribe | null = null;

  constructor(private readonly _firestore: Firestore) {}

  /**
   * Charge les données d'un utilisateur.
   *
   * @param userID L'ID Firebase de l'utilisateur.
   * @returns Un Observable qui émet les données de l'utilisateur.
   */
  loadUserData(userID: string): Observable<User[]> {
    // Réinitialise le subject pour éviter d'avoir des données en double.
    this.userDataSubject.next([]);
    // Crée une collection Firestore pour les utilisateurs.
    const fbCollection = collection(this._firestore, 'users');
    // Crée une clause de recherche pour trouver l'utilisateur par son ID.
    const byUserId: QueryConstraint = where(documentId(), '==', userID);
    // Crée une requête Firestore pour trouver l'utilisateur.
    const q = query(fbCollection, byUserId);
    // Crée un observable qui émet les données de l'utilisateur.
    const datas = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    // Retourne l'observable et met à jour le subject lorsque les données arrivent.
    return datas.pipe(tap((data) => this.userDataSubject.next(data)));
  }

  /**
   * Charge les abonnements d'un utilisateur avec écoute real-time.
   * Utilise onSnapshot pour les changements en temps réel.
   *
   * @param userID L'ID Firebase de l'utilisateur.
   * @returns Un observable qui émet les abonnements de l'utilisateur.
   */
  loadSubData(userID: string): Observable<Subscription[]> {
    if (!userID) {
      console.error('❌ userID est null ou undefined');
      return new Observable((observer) => observer.next([]));
    }

    // Réinitialise le subject
    this.userSubDataSubject.next([]);

    // Crée une requête Firestore
    const fbCollection = collection(this._firestore, 'subscriptions');
    const byUserId: QueryConstraint = where('userID', '==', userID);
    const q = query(fbCollection, byUserId);

    // Nettoie l'ancienne subscription avant d'en créer une nouvelle
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    // Écoute les changements real-time et gère le unsubscribe
    this.unsubscribeSnapshot = onSnapshot(
      q,
      (querySnapshot) => {
        const subscriptions: Subscription[] = [];
        querySnapshot.docs.forEach((doc) => {
          subscriptions.push({
            ...(doc.data() as Subscription),
            id: doc.id,
          });
        });
        this.userSubDataSubject.next(subscriptions);
      },
      (error) => {
        console.error('❌ Erreur loadSubData:', error);
        this.userSubDataSubject.error(error);
      },
    );

    return this.userSubData$;
  }

  /**
   * Charge un abonnement unique par son ID.
   *
   * @param subId L'ID de l'abonnement à charger.
   * @returns Un observable qui émet l'abonnement correspondant ou undefined si l'abonnement n'existe pas.
   */
  loadOneSubData(subId: string): Observable<Subscription | undefined> {
    // Crée une référence à un document Firestore pour l'abonnement.
    const docRef = doc(this._firestore, `subscriptions/${subId}`);
    // Retourne l'abonnement correspondant ou undefined si l'abonnement n'existe pas.
    return docData(docRef, { idField: 'id' }) as Observable<
      Subscription | undefined
    >;
  }

  /**
   * Supprime un abonnement en base de données.
   *
   * @param sub L'abonnement à supprimer.
   */
  async deleteSub(sub: Subscription) {
    // Supprime le document Firestore correspondant à l'abonnement.
    const subDocRef = doc(this._firestore, `subscriptions/${sub.id}`);
    // Supprime le document Firestore.
    await deleteDoc(subDocRef);
  }

  /**
   * Ajoute un abonnement en base de données.
   * @param sub L'abonnement à ajouter (Firestore crée automatiquement l'ID).
   */
  async addSubscription(sub: Partial<Subscription>): Promise<string> {
    try {
      const newSubRef = doc(collection(this._firestore, 'subscriptions'));
      await setDoc(newSubRef, sub);
      console.log('✅ Abonnement créé avec ID:', newSubRef.id);
      return newSubRef.id;
    } catch (error) {
      console.error('❌ Erreur addSubscription:', error);
      throw error;
    }
  }

  /**
   * Met à jour un abonnement en base de données.
   * @param subId L'ID de l'abonnement à mettre à jour.
   * @param sub Les données mises à jour (mise à jour partielle).
   */
  async updateSubscription(
    subId: string,
    sub: Partial<Subscription>,
  ): Promise<void> {
    try {
      const subRef = doc(this._firestore, `subscriptions/${subId}`);
      await updateDoc(subRef, sub as any); // Firestore utilise 'any' en interne
      console.log('✅ Abonnement mis à jour:', subId);
    } catch (error) {
      console.error('❌ Erreur updateSubscription:', error);
      throw error;
    }
  }

  /**
   * Réinitialise les observables avec des valeurs vides.
   * Utile pour nettoyer les données en mémoire lors de la déconnexion.
   */
  clearData(): void {
    console.log('🧹 DataService: Nettoyage des données');
    this.userSubDataSubject.next([]);
    this.userDataSubject.next([]);
    this.cleanup();
  }

  /**
   * Nettoie les écouteurs onSnapshot pour éviter les memory leaks.
   * À appeler lors de la destruction du service ou du logout.
   */
  private cleanup(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
      console.log('✅ onSnapshot unsubscribed');
    }
  }

  /**
   * Lifecycle hook: nettoyage lors de la destruction du service.
   */
  ngOnDestroy(): void {
    this.cleanup();
  }
}
