import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, User as FirebaseUser, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Use a BehaviorSubject so we can manually emit a mock user for the demo
  private userSubject = new BehaviorSubject<any>(null);
  user$: Observable<FirebaseUser | null> = this.userSubject.asObservable();

  constructor() {
    // Listen to real auth state, but don't overwrite if we already set a demo user
    authState(this.auth).subscribe(user => {
      if (!this.isDemoUser()) {
        this.userSubject.next(user);
      }
    });
    
    // Auto-login demo user on refresh if they were logged in
    if (this.isDemoUser()) {
      this.userSubject.next({ uid: 'demo-user-123', email: 'demo@greenledger.com', displayName: 'Demo User' });
    }
  }

  private isDemoUser(): boolean {
    return localStorage.getItem('gl_isDemo') === 'true';
  }

  async login(email: string, pass: string) {
    if (email === 'demo@greenledger.com' && pass === 'demo123') {
      localStorage.setItem('gl_isDemo', 'true');
      this.setSession();
      this.userSubject.next({ uid: 'demo-user-123', email: 'demo@greenledger.com', displayName: 'Demo User' });
      return { user: this.userSubject.value };
    }

    const cred = await signInWithEmailAndPassword(this.auth, email, pass);
    localStorage.removeItem('gl_isDemo');
    this.setSession();
    return cred;
  }

  async googleLogin() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    
    // Create/update user profile if it doesn't exist
    const userDocRef = doc(this.firestore, `users/${cred.user.uid}`);
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
    
    localStorage.removeItem('gl_isDemo');
    this.setSession();
    return cred;
  }

  async resetPassword(email: string) {
    return await sendPasswordResetEmail(this.auth, email);
  }

  async signup(email: string, pass: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
    const appUser: AppUser = {
      uid: cred.user.uid,
      email: email,
      role: 'member',
      displayName: displayName
    };
    await setDoc(doc(this.firestore, `users/${cred.user.uid}`), appUser);
    this.setSession();
    return cred;
  }

  private setSession() {
    localStorage.setItem('gl_loggedIn', 'true');
    localStorage.setItem('gl_sessionExpiry', (Date.now() + 86400000).toString());
  }

  async getUserData(uid: string): Promise<AppUser | null> {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    return userDoc.exists() ? userDoc.data() as AppUser : null;
  }

  async updateProfile(uid: string, data: Partial<AppUser>) {
    return await setDoc(doc(this.firestore, `users/${uid}`), data, { merge: true });
  }

  logout() {
    localStorage.removeItem('gl_isDemo');
    try { signOut(this.auth); } catch(e) {}
    localStorage.removeItem('gl_loggedIn');
    localStorage.removeItem('gl_sessionExpiry');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}

