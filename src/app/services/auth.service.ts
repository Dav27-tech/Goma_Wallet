import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendSignInLinkToEmail,
  User as FirebaseUser,
  Unsubscribe
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { handleFirestoreError, OperationType } from '../utils/firestore-error';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isNewUser: boolean;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private router = inject(Router);
  currentUser = signal<User | null>(null);
  private initialized = signal(false);
  private userDocUnsubscribe: Unsubscribe | null = null;
  private authUnsubscribe: Unsubscribe | null = null;

  constructor() {
    this.authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (this.userDocUnsubscribe) {
        this.userDocUnsubscribe();
        this.userDocUnsubscribe = null;
      }

      if (firebaseUser) {
        // Listen to actual user document for real-time updates
        const userRef = doc(db, 'users', firebaseUser.uid);
        this.userDocUnsubscribe = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: data['displayName'] || '',
              photoURL: data['photoURL'] || '',
              isNewUser: data['isNewUser'] ?? false,
              currency: data['currency'] || 'USD'
            };
            this.currentUser.set(user);
            
            const currentPath = window.location.pathname;
            if (currentPath === '/' || currentPath === '/login') {
              if (user.isNewUser) {
                this.router.navigate(['/onboarding']);
              } else {
                this.router.navigate(['/app']);
              }
            }
          } else {
            // New user, but document hasn't been created yet by loginWithGoogle
            // We set a temporary state if needed, or wait for the Doc create
            const tempUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              isNewUser: true,
              currency: 'USD'
            };
            this.currentUser.set(tempUser);
          }
          this.initialized.set(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          this.initialized.set(true);
        });
      } else {
        this.currentUser.set(null);
        this.initialized.set(true);
      }
    });
  }

  ngOnDestroy() {
    if (this.authUnsubscribe) this.authUnsubscribe();
    if (this.userDocUnsubscribe) this.userDocUnsubscribe();
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          isNewUser: true,
          currency: 'USD'
        };
        
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp()
        });
        
        // Navigation will be handled by the snapshot listener in constructor
      } else {
        // Navigation will be handled by the snapshot listener in constructor
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);
      if (error.code === 'auth/internal-error') {
        alert('Erreur interne Firebase Auth. Cela peut arriver si les cookies tiers sont bloqués ou si le domaine n\'est pas autorisé.');
      }
      throw error;
    }
  }

  async loginWithEmail(email: string) {
    console.log('Envoi du lien de connexion à:', email);
    throw new Error('Pour ce prototype, veuillez utiliser la connexion Google.');
  }

  async logout() {
    await signOut(auth);
    if (this.userDocUnsubscribe) {
      this.userDocUnsubscribe();
      this.userDocUnsubscribe = null;
    }
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isInitialized(): boolean {
    return this.initialized();
  }
}
