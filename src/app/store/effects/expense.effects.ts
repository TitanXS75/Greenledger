import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExpenseService } from '../../services/expense.service';
import * as ExpenseActions from '../actions/expense.actions';
import { catchError, map, mergeMap, of, switchMap, from } from 'rxjs';

@Injectable()
export class ExpenseEffects {
  constructor(
    private actions$: Actions,
    private expenseService: ExpenseService
  ) {}

  loadExpenses$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.loadExpenses),
    switchMap(() => this.expenseService.getExpenses().pipe(
      map(expenses => ExpenseActions.loadExpensesSuccess({ expenses })),
      catchError((error: any) => of(ExpenseActions.loadExpensesFailure({ error: error.message })))
    ))
  ));

  addExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.addExpense),
    mergeMap(({ expense }) => from(this.expenseService.addExpense(expense)).pipe(
      map(() => ExpenseActions.loadExpenses()),
      catchError((error: any) => of(ExpenseActions.setError({ error: error.message })))
    ))
  ));

  updateExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.updateExpense),
    mergeMap(({ id, data }) => from(this.expenseService.updateExpense(id, data)).pipe(
      map(() => ExpenseActions.updateExpenseSuccess()),
      catchError((error: any) => of(ExpenseActions.setError({ error: error.message })))
    ))
  ));

  deleteExpense$ = createEffect(() => this.actions$.pipe(
    ofType(ExpenseActions.deleteExpense),
    mergeMap(({ id }) => from(this.expenseService.softDeleteExpense(id)).pipe(
      map(() => ExpenseActions.deleteExpenseSuccess({ id })),
      catchError((error: any) => of(ExpenseActions.setError({ error: error.message })))
    ))
  ));
}
