import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Expense, ExpenseCategory, PaymentMode } from '../../models/expense.model';

@Component({
  selector: 'app-expense-form-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatRadioModule, 
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './expense-form-dialog.component.html',
  styleUrls: ['./expense-form-dialog.component.scss']
})
export class ExpenseFormDialogComponent {
  expenseForm: FormGroup;
  categories = Object.values(ExpenseCategory);
  paymentModes = Object.values(PaymentMode);
  maxDate = new Date();
  
  quickAmounts: number[] = [100];
  showQuickAmountInput = false;
  newQuickAmount: number | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ExpenseFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense?: Expense }
  ) {
    this.expenseForm = this.fb.group({
      amount: [data.expense?.amount || '', [Validators.required, Validators.min(1)]],
      category: [data.expense?.category || '', Validators.required],
      description: [data.expense?.description || '', [Validators.required, Validators.maxLength(200)]],
      date: [data.expense ? new Date(data.expense.date) : new Date(), Validators.required],
      paymentMode: [data.expense?.paymentMode || PaymentMode.CASH, Validators.required]
    });

    const stored = localStorage.getItem('gl_quick_amounts');
    if (stored) {
      this.quickAmounts = JSON.parse(stored);
    }
  }

  get amount() { return this.expenseForm.get('amount'); }
  get category() { return this.expenseForm.get('category'); }
  get description() { return this.expenseForm.get('description'); }
  get date() { return this.expenseForm.get('date'); }
  get paymentMode() { return this.expenseForm.get('paymentMode'); }

  toggleQuickAmountInput(): void {
    this.showQuickAmountInput = !this.showQuickAmountInput;
    this.newQuickAmount = null;
  }

  saveQuickAmount(): void {
    if (this.newQuickAmount && this.newQuickAmount > 0) {
      if (this.quickAmounts.length < 4) {
        this.quickAmounts.push(this.newQuickAmount);
        localStorage.setItem('gl_quick_amounts', JSON.stringify(this.quickAmounts));
      }
      this.toggleQuickAmountInput();
    }
  }

  removeQuickAmount(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.quickAmounts.splice(index, 1);
    localStorage.setItem('gl_quick_amounts', JSON.stringify(this.quickAmounts));
  }

  setAmount(amount: number): void {
    this.expenseForm.patchValue({ amount });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.dialogRef.close({ action: 'delete', id: this.data.expense?.id });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const val = this.expenseForm.getRawValue();
      const dateStr = new Date(val.date).toISOString().split('T')[0];
      this.dialogRef.close({ 
        ...val, 
        date: dateStr 
      });
    }
  }
}
