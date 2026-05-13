import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  collectionSnapshots,
  docSnapshots,
  DocumentData,
  QueryDocumentSnapshot,
  orderBy
} from '@angular/fire/firestore';
import { Observable, map, of, tap, switchMap, from } from 'rxjs';
import { Expense, DailySummary } from '../models/expense.model';
import { CacheService } from './cache.service';
import { Auth, authState } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private firestore = inject(Firestore);
  private cache = inject(CacheService);
  private auth = inject(Auth);

  getExpenses(): Observable<Expense[]> {
    // Reactively wait for user auth state
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);

        const expensesRef = collection(this.firestore, 'expenses');
        const q = query(
          expensesRef, 
          where('createdBy', '==', user.uid)
        );
        
        return collectionSnapshots(q).pipe(
          map((actions: QueryDocumentSnapshot<DocumentData>[]) => 
            actions.map(a => {
              const data = a.data() as Expense;
              return { ...data, id: a.id };
            })
            // Client-side filter and sort
            .filter(e => e.isDeleted !== true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          ),
          tap(expenses => this.cache.setCachedExpenses('user_expenses', expenses))
        );
      })
    );
  }

  async addExpense(expense: Omit<Expense, 'id' | 'createdBy' | 'createdAt'>): Promise<any> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const expensesRef = collection(this.firestore, 'expenses');
    const newExpense = {
      ...expense,
      amount: Number(expense.amount), // Ensure it's a number
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    console.log('Adding expense to Firestore:', newExpense);
    return await addDoc(expensesRef, newExpense);
  }

  async updateExpense(id: string, data: Partial<Expense>): Promise<void> {
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return await updateDoc(expenseDoc, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  async softDeleteExpense(id: string): Promise<void> {
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return await updateDoc(expenseDoc, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
  }

  getDailySummary(date: string): Observable<DailySummary | null> {
    const summaryDoc = doc(this.firestore, `daily-summaries/${date}`);
    return docSnapshots(summaryDoc).pipe(
      map(snap => snap.exists() ? snap.data() as DailySummary : null)
    );
  }
}
