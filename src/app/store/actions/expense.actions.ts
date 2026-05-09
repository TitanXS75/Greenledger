import { createAction, props } from '@ngrx/store';
import { Expense, ExpenseFilter } from '../../models/expense.model';

export const loadExpenses = createAction('[Expense] Load');
export const loadExpensesSuccess = createAction('[Expense] Load Success', props<{ expenses: Expense[] }>());
export const loadExpensesFailure = createAction('[Expense] Load Failure', props<{ error: string }>());

export const addExpense = createAction('[Expense] Add', props<{ expense: Omit<Expense, 'id'> }>());
export const addExpenseSuccess = createAction('[Expense] Add Success', props<{ expense: Expense }>());

export const updateExpense = createAction('[Expense] Update', props<{ id: string; data: Partial<Expense> }>());
export const updateExpenseSuccess = createAction('[Expense] Update Success');

export const deleteExpense = createAction('[Expense] Delete', props<{ id: string }>());
export const deleteExpenseSuccess = createAction('[Expense] Delete Success', props<{ id: string }>());

export const setFilter = createAction('[Expense] Set Filter', props<{ filter: ExpenseFilter }>());
export const setError = createAction('[Expense] Set Error', props<{ error: string }>());
