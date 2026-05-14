import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, DocumentData } from '@angular/fire/firestore';

export const roleGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);
  const firestore = inject(Firestore);

  // Wait for Firebase to restore auth state (one-shot listener)
  const user = await new Promise<any>(resolve => {
    const unsub = auth.onAuthStateChanged(u => {
      unsub();
      resolve(u);
    });
  });

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // New user — doc might not be created yet, allow access as member
      return true;
    }

    const userData = userSnap.data() as DocumentData;
    // Allow all authenticated users (admin or member). 
    // Only explicitly block if role is 'blocked' or similar denial roles.
    if (userData && userData['role'] === 'blocked') {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  } catch (e) {
    // On Firestore error (e.g. offline or permissions), allow access
    console.warn('roleGuard: Firestore check failed, allowing access', e);
    return true;
  }
};
