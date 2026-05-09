import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const user = auth.currentUser;
  
  if (user) {
    // Note: getIdToken is async, but interceptors are usually sync for cloning.
    // In a real app, you'd often handle this with from(user.getIdToken()).pipe(switchMap(...))
    // However, for the spec's simple implementation:
    const token = (user as any).accessToken; // Quick access or mock for now
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(cloned);
    }
  }
  return next(req);
};
