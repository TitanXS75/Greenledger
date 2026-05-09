import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExpenseState } from '../reducers/expense.reducer';

export const selectExpenseState = createFeatureSelector<ExpenseState>('expenses');

export const selectAllExpenses = createSelector(
  selectExpenseState,
  (state) => state.expenses
);

export const selectFilteredExpenses = createSelector(
  selectExpenseState,
  (state) => {
    let filtered = state.expenses;
    const { searchText, category, dateFrom, dateTo } = state.filter;

    if (searchText) {
      filtered = filtered.filter(e => e.description.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    if (dateFrom) {
      filtered = filtered.filter(e => e.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(e => e.date <= dateTo);
    }
    return filtered;
  }
);

export const selectTotalAmount = createSelector(
  selectFilteredExpenses,
  (expenses) => expenses.reduce((sum, e) => sum + e.amount, 0)
);

export const selectExpenseLoading = createSelector(
  selectExpenseState,
  (state) => state.loading
);

export const selectExpenseError = createSelector(
  selectExpenseState,
  (state) => state.error
);
