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
  QueryDocumentSnapshot
} from '@angular/fire/firestore';
import { Observable, map, of, tap } from 'rxjs';
import { Expense, DailySummary } from '../models/expense.model';
import { CacheService } from './cache.service';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private firestore = inject(Firestore);
  private cache = inject(CacheService);
  private auth = inject(Auth);

  getExpenses(): Observable<Expense[]> {
    const user = this.auth.currentUser;
    if (!user) return of([]);

    const expensesRef = collection(this.firestore, 'expenses');
    const q = query(expensesRef, where('createdBy', '==', user.uid), where('isDeleted', '!=', true));
    
    return collectionSnapshots(q).pipe(
      map((actions: QueryDocumentSnapshot<DocumentData>[]) => actions.map(a => {
        const data = a.data() as Expense;
        const id = a.id;
        return { ...data, id };
      })),
      tap(expenses => this.cache.setCachedExpenses('user_expenses', expenses))
    );
  }

  addExpense(expense: Omit<Expense, 'id'>): Promise<any> {
    const expensesRef = collection(this.firestore, 'expenses');
    return addDoc(expensesRef, {
      ...expense,
      createdBy: this.auth.currentUser?.uid,
      createdAt: new Date().toISOString()
    });
  }

  updateExpense(id: string, data: Partial<Expense>): Promise<void> {
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return updateDoc(expenseDoc, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  softDeleteExpense(id: string): Promise<void> {
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return updateDoc(expenseDoc, {
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
