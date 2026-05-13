import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseAuthProfile,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Firebase Auth state as observable — always in sync
  user$: Observable<FirebaseUser | null> = authState(this.auth);

  async login(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, pass);
    return cred;
  }

  async googleLogin() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);

    // Create user profile if it doesn't exist
    const userDocRef = doc(this.firestore, `users/${cred.user.uid}`);
    try {
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email!,
          role: 'member',
          displayName: cred.user.displayName || 'Google User'
        };
        await setDoc(userDocRef, appUser);
      }
    } catch (e) {
      console.warn('Firestore permissions denied during googleLogin, skipping db update');
    }

    return cred;
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  async signup(email: string, pass: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateFirebaseAuthProfile(cred.user, { displayName });
    
    const appUser: AppUser = {
      uid: cred.user.uid,
      email: email,
      role: 'member',
      displayName: displayName
    };
    await setDoc(doc(this.firestore, `users/${cred.user.uid}`), appUser);
    return cred;
  }

  async getUserData(uid: string): Promise<AppUser | null> {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    return userDoc.exists() ? (userDoc.data() as AppUser) : null;
  }

  async updateProfile(uid: string, data: Partial<AppUser>) {
    return await setDoc(doc(this.firestore, `users/${uid}`), data, { merge: true });
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
