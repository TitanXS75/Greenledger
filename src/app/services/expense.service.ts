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
import { Observable, from, map, of, tap, BehaviorSubject } from 'rxjs';
import { Expense, ExpenseCategory, PaymentMode, DailySummary } from '../models/expense.model';
import { CacheService } from './cache.service';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private firestore = inject(Firestore);
  private cache = inject(CacheService);
  private auth = inject(Auth);

  // Mock data for demo
  private mockExpenses = new BehaviorSubject<Expense[]>([
    { id: '1', amount: 450, category: ExpenseCategory.FOOD, description: 'Lunch at Cafe', date: new Date().toISOString().split('T')[0], paymentMode: PaymentMode.CARD, createdBy: 'demo-user-123', createdAt: new Date().toISOString() },
    { id: '2', amount: 1200, category: ExpenseCategory.TRAVEL, description: 'Flight Ticket', date: new Date().toISOString().split('T')[0], paymentMode: PaymentMode.UPI, createdBy: 'demo-user-123', createdAt: new Date().toISOString() }
  ]);

  getExpenses(): Observable<Expense[]> {
    const isDemo = localStorage.getItem('gl_isDemo') === 'true';
    if (isDemo) {
      return this.mockExpenses.asObservable();
    }

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
    if (localStorage.getItem('gl_isDemo') === 'true') {
      const newExp = { ...expense, id: Date.now().toString(), createdBy: 'demo-user-123', createdAt: new Date().toISOString() };
      this.mockExpenses.next([...this.mockExpenses.value, newExp as Expense]);
      return Promise.resolve(newExp);
    }
    const expensesRef = collection(this.firestore, 'expenses');
    return addDoc(expensesRef, {
      ...expense,
      createdBy: this.auth.currentUser?.uid,
      createdAt: new Date().toISOString()
    });
  }

  updateExpense(id: string, data: Partial<Expense>): Promise<void> {
    if (localStorage.getItem('gl_isDemo') === 'true') {
      const updated = this.mockExpenses.value.map(e => e.id === id ? { ...e, ...data } : e);
      this.mockExpenses.next(updated as Expense[]);
      return Promise.resolve();
    }
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return updateDoc(expenseDoc, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  softDeleteExpense(id: string): Promise<void> {
    if (localStorage.getItem('gl_isDemo') === 'true') {
      const updated = this.mockExpenses.value.filter(e => e.id !== id);
      this.mockExpenses.next(updated);
      return Promise.resolve();
    }
    const expenseDoc = doc(this.firestore, `expenses/${id}`);
    return updateDoc(expenseDoc, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
  }

  getDailySummary(date: string): Observable<DailySummary | null> {
    if (localStorage.getItem('gl_isDemo') === 'true') {
      const exps = this.mockExpenses.value.filter(e => e.date === date);
      const grandTotal = exps.reduce((s, e) => s + e.amount, 0);
      return of({ date, totalsByCategory: {}, grandTotal, generatedAt: new Date().toISOString() });
    }
    const summaryDoc = doc(this.firestore, `daily-summaries/${date}`);
    return docSnapshots(summaryDoc).pipe(
      map(snap => snap.exists() ? snap.data() as DailySummary : null)
    );
  }
}
