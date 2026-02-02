import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user as firebaseUser,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { DataService } from '../data/data.service';
import { map, Observable } from 'rxjs';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Constructeur du service d'authentification.
   *
   * Configure un listener sur les changements d'état de l'authentification Firebase.
   * Lorsqu'un utilisateur est connecté, charge les données de l'utilisateur en Firestore.
   *
   * @param _auth Le service d'authentification Firebase.
   * @param _router Le service de routage Angular.
   * @param _dataService Le service de données Firestore.
   */
  constructor(
    private readonly _auth: Auth,
    private readonly _router: Router,
    private readonly _dataService: DataService,
  ) {
    // Crée un listener qui s'exécute à chaque fois que l'état d'authentification change.
    // Si un utilisateur est connecté, charge les données de l'utilisateur en Firestore.
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Firebase Auth State Changed:', user);

      if (!user) {
        console.warn('⚠️ Aucun utilisateur connecté !');
        return;
      }

      // Charge les données de l'utilisateur en Firestore.
      // Si un utilisateur est trouvé, affiche un message de réussite.
      // Sinon, affiche un message de warning.
      this._dataService.loadUserData(user.uid).subscribe((firestoreUser) => {
        if (firestoreUser.length > 0) {
          console.log('✅ Firestore User Loaded:', firestoreUser[0]);
        } else {
          console.warn('⚠️ Aucun utilisateur trouvé en Firestore');
        }
      });
    });
  }

  /**
   * Effectue une connexion avec Google via Firebase Authentication.
   *
   * 1. Appelle `signInWithGoogle` de `@capacitor-firebase/authentication` pour lancer la
   *    connexion avec Google.
   * 2. Vérifie si un utilisateur est bien retourné. Sinon, affiche un message d'erreur.
   * 3. Crée un `authCredential` à partir du jeton de connexion Google.
   * 4. Appelle `signInWithCredential` pour se connecter avec l'authentification Firebase.
   * 5. Vérifie si un utilisateur est bien retourné. Sinon, affiche un message d'erreur.
   * 6. Charge les données de l'utilisateur en Firestore.
   *    Si l'utilisateur n'existe pas, crée un nouvel utilisateur.
   * 7. Redirige vers `/home`.
   *
   * @throws {Error} Si une erreur se produit lors de la connexion.
   */
  async serviceLoginWithGoogle() {
    try {
      console.log('🚀 Début de serviceLoginWithGoogle()');

      // Demande une connexion avec Google via l'API Capacitor-firebase/authentication.
      // La méthode signInWithGoogle() renvoie un objet Credential qui contient
      // un jeton de connexion Google.
      const credential = await FirebaseAuthentication.signInWithGoogle();

      console.log('📦 Credential reçu:', JSON.stringify(credential, null, 2));
      console.log('👤 credential.user:', credential.user);
      console.log('🔑 credential.credential:', credential.credential);

      if (!credential.user) {
        console.error('❌ Aucun utilisateur récupéré après signInWithGoogle');
        console.error('📦 Credential complet:', credential);
        return;
      }

      console.log('✅ Google Auth Response:', credential);

      // Crée un authCredential à partir du jeton de connexion Google.
      const authCredential = GoogleAuthProvider.credential(
        credential.credential?.idToken,
      );
      // Appelle signInWithCredential() pour se connecter avec l'authentification Firebase.
      await signInWithCredential(this._auth, authCredential);

      // Récupère l'utilisateur Firebase actuel.
      const firebaseUser = await FirebaseAuthentication.getCurrentUser();

      if (!firebaseUser.user) {
        console.error("❌ Firebase n'a pas récupéré l'utilisateur !");
        return;
      }

      // Charge les données de l'utilisateur en Firestore.
      const db = getFirestore();
      const userRef = doc(db, `users/${firebaseUser.user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("ℹ️ Création d'un nouvel utilisateur Firestore.");
        // Crée un nouvel utilisateur Firestore si l'utilisateur n'existe pas.
        await setDoc(userRef, {
          email: firebaseUser.user.email,
          fullName: firebaseUser.user.displayName,
          uid: firebaseUser.user.uid,
        });
        console.log('✅ Firestore écrit avec succès !');
      }

      console.log('➡️ Redirection vers /home');
      // Redirige vers `/home` si tout s'est bien déroulé.
      this._router.navigate(['/home']);
    } catch (error) {
      console.error('❌ Erreur lors de la connexion Google:', error);
    }
  }

  /**
   * Connexion avec email et mot de passe.
   * @param {string} email - Adresse email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @returns {Promise<void>} - Une promesse qui se résout lorsque la connexion est terminée.
   * @throws {FirebaseError} - Si une erreur se produit lors de la connexion.
   */
  async serviceLoginWithemail(email: string, password: string): Promise<void> {
    // Tente de se connecter avec l'adresse email et le mot de passe
    const credential = await signInWithEmailAndPassword(
      this._auth,
      email,
      password,
    );

    // Vérifie si les informations d'identification ont été récupérées
    if (credential) {
      // Redirige vers la page d'accueil
      this._router.navigate(['/home']);
    }
  }

  /**
   * Crée un compte utilisateur avec une adresse email et un mot de passe.
   * @param {string} email - Adresse email de l'utilisateur.
   * @param {string} password - Mot de passe de l'utilisateur.
   * @param {string} fullName - Nom complet de l'utilisateur.
   * @returns {Promise<void>} - Une promesse qui se résout lorsque la création du compte est terminée.
   * @throws {FirebaseError} - Si une erreur se produit lors de la création du compte.
   */
  async serviceSigninWithEmail(
    email: string,
    password: string,
    fullName: string,
  ) {
    try {
      // Crée un utilisateur Firebase avec l'adresse email et le mot de passe.
      const userCredential = await createUserWithEmailAndPassword(
        this._auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Mise à jour du nom complet de l'utilisateur.
      updateProfile(user, { displayName: fullName })
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });

      // Récupère les informations de l'utilisateur.
      if (user) {
        console.log('✅ Utilisateur créé avec succès !');
      } else {
        console.error('❌ User data not available');
      }

      // Redirige vers `/home` si tout s'est bien déroulé.
      this._router.navigate(['/home']);
    } catch (error: any) {
      // Affiche les erreurs si une erreur se produit.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error ${errorCode}: ${errorMessage}`);
    }
  }

  /**
   * Déconnecte l'utilisateur et le redirige vers la page de connexion.
   * @returns {Promise<void>} - Une promesse qui se résout lorsque la déconnexion est terminée.
   */
  async logout() {
    /*************  ✨ Codeium Command 🌟  *************/
    // Déconnecte l'utilisateur de Firebase Authentication.
    await this._auth.signOut();

    // Déconnecte l'utilisateur de l'API Firebase Authentication.
    await FirebaseAuthentication.signOut();

    // Efface le cache de Capacitor Storage pour éviter la ré-authentification automatique.
    // Firebase persiste les sessions dans le storage; il faut les nettoyer manuellement.
    await Preferences.clear();

    console.log('✅ Utilisateur déconnecté et cache vidé');

    // Réinitialise les données de l'utilisateur.
    this._dataService.clearData();

    // Redirige vers la page de connexion.
    this._router.navigate(['/login']);
    /******  371681db-b683-4ae8-bc75-723718bc2baa  *******/
  }

  /**
   * Vérifie si un utilisateur est actuellement authentifié.
   *
   * Observe l'état d'authentification de l'utilisateur à travers Firebase.
   *
   * @returns {Observable<boolean>} - Un observable qui émet `true` si un utilisateur est authentifié, sinon `false`.
   */

  isAuthenticated(): Observable<boolean> {
    // Observe l'état d'authentification de l'utilisateur.
    return firebaseUser(this._auth).pipe(
      // Si un utilisateur est retourné, renvoie true, sinon false.
      map((user) => {
        console.log(
          '🚀 Vérification Auth - Utilisateur:',
          user ? 'authentifié' : 'non authentifié',
        );
        return !!user;
      }),
    );
  }

  /**
   * Retourne l'utilisateur actuellement authentifié.
   *
   * Observe l'utilisateur actuellement authentifié à travers Firebase.
   *
   * @returns {Observable<User | null>} - Un observable qui émet l'utilisateur actuellement authentifié s'il existe, sinon `null`.
   */
  getCurrentUser(): Observable<User | null> {
    return firebaseUser(this._auth);
  }
}
