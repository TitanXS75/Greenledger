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
    if (userData && (userData['role'] === 'admin' || userData['role'] === 'member')) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  } catch (e) {
    // On Firestore error (e.g. offline), allow access rather than blocking
    console.warn('roleGuard: Firestore check failed, allowing access', e);
    return true;
  }
};
