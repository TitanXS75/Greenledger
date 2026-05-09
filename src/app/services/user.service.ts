import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUser(userId: string): Observable<User> {
    const mockUser: User = {
      id: userId,
      email: 'user@example.com',
      displayName: 'Test User',
      role: UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return of(mockUser);
  }

  updateUserProfile(userId: string, updates: Partial<User>): Observable<User> {
    const mockUser: User = {
      id: userId,
      email: updates.email || 'user@example.com',
      displayName: updates.displayName || 'Test User',
      role: updates.role || UserRole.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return of(mockUser);
  }

  getUserRole(userId: string): Observable<UserRole> {
    return of(UserRole.MEMBER);
  }
}
