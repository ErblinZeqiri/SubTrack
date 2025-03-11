import { Injectable, Injector } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { collection, collectionData, doc, docData, documentId, Firestore, query, QueryConstraint, where, onSnapshot } from '@angular/fire/firestore';
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();

  // private _auth!: AuthService;
  /**
   * Constructeur du service de données.
   *
   * @param _firestore Le service Firestore Angular.
   * @param injector L'injecteur Angular.
   */
  constructor(
    private readonly _firestore: Firestore,
    // private injector: Injector
  ) {}

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
   * Charge les abonnements d'un utilisateur.
   *
   * @param userID L'ID Firebase de l'utilisateur.
   * @returns Un observable qui émet les abonnements de l'utilisateur.
   *
   * Note: cette méthode utilise {@link onSnapshot} pour écouter les changements
   * sur les abonnements de l'utilisateur. La méthode met à jour le subject
   * `userSubDataSubject` à chaque fois qu'un changement est détecté.
   */
  async loadSubData(userID: string) {
    // Réinitialise le subject pour éviter d'avoir des données en double.
    this.userSubDataSubject.next([]);
    if (!userID) {
      console.error('userID est null ou undefined');
      return;
    }

    // Crée une collection Firestore pour les abonnements.
    const fbCollection = collection(this._firestore, 'subscriptions');
    // Crée une clause de recherche pour trouver les abonnements par l'ID de l'utilisateur.
    const byUserId: QueryConstraint = where('userID', '==', userID);
    // Crée une requête Firestore pour trouver les abonnements.
    const q = query(fbCollection, byUserId);
    // Écoute les changements sur les abonnements de l'utilisateur.
    onSnapshot(q, (querySnapshot) => {
      // Parcours les documents de la requête.
      querySnapshot.docs.forEach((doc) => {
        const index = this.userSubDataSubject.value.findIndex(
          (sub) => sub.id === doc.id
        );
        // Si l'abonnement existe déjà, met à jour son contenu.
        if (index !== -1) {
          this.userSubDataSubject.value[index] = {
            ...(doc.data() as Subscription),
            id: doc.id,
          } as Subscription;
        } else {
          // Sinon, ajoute l'abonnement à la liste.
          this.userSubDataSubject.value.push({
            ...(doc.data() as Subscription),
            id: doc.id,
          });
        }
        // Met à jour le subject pour que les composants s'en rendent compte.
        this.userSubDataSubject.next([...this.userSubDataSubject.value]);
      });
    });
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
   *
   * @param sub L'abonnement à ajouter.
   */
  async addSubscription(sub: any) {
    // Crée un document Firestore pour l'abonnement.
    const newSubRef = doc(collection(this._firestore, 'subscriptions'));
    // Enregistre l'abonnement en Firestore.
    await setDoc(newSubRef, sub);
  }

  /**
   * Met à jour un abonnement en base de données.
   *
   * @param subId L'ID de l'abonnement à mettre à jour.
   * @param sub Les données de l'abonnement mises à jour.
   */
  async updateSubscription(subId: string, sub: any) {
    // Crée une référence au document Firestore de l'abonnement à mettre à jour.
    const subRef = doc(this._firestore, `subscriptions/${subId}`);
    // Met à jour le document Firestore avec les nouvelles données de l'abonnement.
    await updateDoc(subRef, sub);
  }

  /**
   * Réinitialise les observables de la classe avec des valeurs vides.
   * Utile pour nettoyer les données en mémoire lorsque l'utilisateur se déconnecte.
   */
  clearData() {
    // Réinitialiser les observables avec des valeurs vides
    this.userSubDataSubject.next([]);
    this.userDataSubject.next([]);
  }

  /**
   * Lifecycle hook appelé lorsque le composant est détruit.
   *
   * Réinitialise les observables de la classe avec des valeurs vides pour éviter
   * les fuites de mémoire.
   */
  ngOnDestroy() {
    // Réinitialise les observables avec des valeurs vides pour éviter les fuites de mémoire.
    this.userDataSubject.next([]); // Réinitialise les données de l'utilisateur.
    this.userSubDataSubject.next([]); // Réinitialise les abonnements de l'utilisateur.
  }
}
