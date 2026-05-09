import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-expense-summary',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatDatepickerModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './expense-summary.component.html',
  styleUrls: ['./expense-summary.component.scss']
})
export class ExpenseSummaryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);

  summaryForm: FormGroup;
  summaryData$: Observable<any>;
  
  categories: string[] = [];
  grandTotal = 0;
  categoryTotals: { [key: string]: number } = {};

  constructor() {
    this.summaryForm = this.fb.group({
      mode: ['today'], // 'today', 'monthly', 'range'
      date: [new Date()],
      month: [new Date().toISOString().substring(0, 7)],
      startDate: [null],
      endDate: [null]
    });

    this.summaryData$ = combineLatest([
      this.expenseService.getExpenses(),
      this.summaryForm.valueChanges.pipe(startWith(this.summaryForm.value))
    ]).pipe(
      map(([expenses, filters]) => {
        const filtered = this.filterExpenses(expenses, filters);
        return this.aggregateExpenses(filtered);
      })
    );
  }

  ngOnInit(): void {
    this.summaryData$.subscribe(data => {
      this.categories = data.categories;
      this.grandTotal = data.grandTotal;
      this.categoryTotals = data.categoryTotals;
    });
  }

  private filterExpenses(expenses: Expense[], filters: any): Expense[] {
    const { mode, date, month, startDate, endDate } = filters;

    return expenses.filter(exp => {
      const expDate = exp.date; // YYYY-MM-DD
      
      if (mode === 'today' && date) {
        const selectedDate = new Date(date).toISOString().split('T')[0];
        return expDate === selectedDate;
      }
      
      if (mode === 'monthly' && month) {
        return expDate.startsWith(month);
      }
      
      if (mode === 'range' && startDate && endDate) {
        const start = new Date(startDate).toISOString().split('T')[0];
        const end = new Date(endDate).toISOString().split('T')[0];
        return expDate >= start && expDate <= end;
      }
      
      return false;
    });
  }

  private aggregateExpenses(expenses: Expense[]) {
    const totals: { [key: string]: number } = {};
    let grandTotal = 0;

    expenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
      grandTotal += exp.amount;
    });

    return {
      categories: Object.keys(totals).sort((a, b) => totals[b] - totals[a]),
      categoryTotals: totals,
      grandTotal
    };
  }

  getPercentage(amount: number): number {
    return this.grandTotal > 0 ? (amount / this.grandTotal) * 100 : 0;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Food': 'restaurant',
      'Travel': 'flight',
      'Bills': 'receipt_long',
      'Shopping': 'shopping_bag',
      'Entertainment': 'movie',
      'Health': 'medical_services',
      'Other': 'more_horiz'
    };
    return icons[category] || 'category';
  }
}
