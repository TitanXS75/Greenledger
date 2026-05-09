import { createReducer, on } from '@ngrx/store';
import { Expense, ExpenseCategory, ExpenseFilter } from '../../models/expense.model';
import * as ExpenseActions from '../actions/expense.actions';

export interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  filter: ExpenseFilter;
}

export const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
  filter: {
    searchText: '',
    category: null,
    dateFrom: null,
    dateTo: null,
  }
};

export const expenseReducer = createReducer(
  initialState,
  on(ExpenseActions.loadExpenses, (state) => ({ ...state, loading: true })),
  on(ExpenseActions.loadExpensesSuccess, (state, { expenses }) => ({ ...state, expenses, loading: false })),
  on(ExpenseActions.loadExpensesFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(ExpenseActions.addExpenseSuccess, (state, { expense }) => ({ ...state, expenses: [...state.expenses, expense] })),
  on(ExpenseActions.deleteExpenseSuccess, (state, { id }) => ({ 
    ...state, 
    expenses: state.expenses.filter(e => e.id !== id) 
  })),
  on(ExpenseActions.setFilter, (state, { filter }) => ({ ...state, filter })),
  on(ExpenseActions.setError, (state, { error }) => ({ ...state, error }))
);
