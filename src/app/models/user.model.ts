export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'member';
  displayName?: string;
  contact?: string;
  age?: number;
}
