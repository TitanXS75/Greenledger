import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseService } from '../../services/expense.service';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.model';
import { AppUser } from '../../models/user.model';
import { CalculatorComponent } from '../shared/calculator/calculator.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  currentUser: AppUser | null = null;
  expenses: Expense[] = [];
  totalExpenses = 0;
  monthlyExpenses = 0;
  todayExpenses = 0;

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user as any;
    });

    this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses;
      this.calculateStats();
    });
  }

  private calculateStats(): void {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    this.totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    this.monthlyExpenses = this.expenses
      .filter(exp => exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.todayExpenses = this.expenses
      .filter(exp => exp.date === today)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }

  openCalculator(): void {
    this.dialog.open(CalculatorComponent, {
      width: '360px',
      panelClass: 'calculator-dialog'
    });
  }
}
