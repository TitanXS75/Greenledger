import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Firestore, doc, getDoc, DocumentData } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { from, map, of, switchMap, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  if (localStorage.getItem('gl_isDemo') === 'true') {
    return true;
  }

  const router = inject(Router);
  const auth = inject(Auth);
  const firestore = inject(Firestore);

  return authState(auth).pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }
      // Bypass Firestore check for demo user
      if (user.uid === 'demo-user-123') {
        return of(true);
      }
      const userDocRef = doc(firestore, `users/${user.uid}`);
      return from(getDoc(userDocRef)).pipe(
        map(userSnap => {
          if (!userSnap.exists()) {
            router.navigate(['/dashboard']);
            return false;
          }
          const userData = userSnap.data() as DocumentData;
          if (userData && (userData['role'] === 'admin' || userData['role'] === 'member')) {
            return true;
          }
          router.navigate(['/dashboard']);
          return false;
        })
      );
    })
  );
};
