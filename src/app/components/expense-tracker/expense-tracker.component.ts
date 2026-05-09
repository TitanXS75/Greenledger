import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastService } from '../../services/toast.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { Expense, ExpenseCategory } from '../../models/expense.model';
import * as ExpenseActions from '../../store/actions/expense.actions';
import * as ExpenseSelectors from '../../store/selectors/expense.selectors';
import { ExpenseFormDialogComponent } from '../expense-form-dialog/expense-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ResponsiveTableComponent } from '../shared/responsive-table/responsive-table.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, 
    MatDialogModule, MatCardModule, ResponsiveTableComponent
  ],
  templateUrl: './expense-tracker.component.html',
  styleUrls: ['./expense-tracker.component.scss']
})
export class ExpenseTrackerComponent implements OnInit {
  filteredExpenses$: Observable<Expense[]>;
  totalAmount$: Observable<number>;
  displayedColumns: string[] = ['date', 'category', 'description', 'amount', 'actions'];
  filterForm: FormGroup;
  categories = Object.values(ExpenseCategory);
  isAdmin = false;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.filteredExpenses$ = this.store.select(ExpenseSelectors.selectFilteredExpenses);
    this.totalAmount$ = this.store.select(ExpenseSelectors.selectTotalAmount);
    
    this.filterForm = this.fb.group({
      searchText: [''],
      category: [null],
      dateFrom: [null],
      dateTo: [null]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ExpenseActions.loadExpenses());
    
    // Check if admin (simplified for demo, should be from a selector/observable)
    this.isAdmin = localStorage.getItem('user_role') === 'admin';

    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(filter => {
      this.store.dispatch(ExpenseActions.setFilter({ filter }));
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, { width: '450px', data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.store.dispatch(ExpenseActions.addExpense({ expense: result }));
    });
  }

  editExpense(expense: Expense): void {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, { width: '450px', data: { expense } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.store.dispatch(ExpenseActions.deleteExpense({ id: result.id }));
        } else {
          this.store.dispatch(ExpenseActions.updateExpense({ id: expense.id, data: result }));
        }
      }
    });
  }

  deleteExpense(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Expense', message: 'Are you sure you want to delete this expense?' }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) this.store.dispatch(ExpenseActions.deleteExpense({ id }));
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    this.filteredExpenses$.subscribe(data => {
      autoTable(doc, {
        head: [['Date', 'Category', 'Description', 'Amount', 'Mode']],
        body: data.map(e => [e.date, e.category, e.description, `₹${e.amount}`, e.paymentMode]),
      });
      doc.save('GreenLedger_Expenses.pdf');
    }).unsubscribe();
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', category: null, dateFrom: null, dateTo: null });
  }
}
