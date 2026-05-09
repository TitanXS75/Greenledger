# GreenLedger Project - Missing & Pending Requirements Report

I have reviewed the current codebase in your directory and compared it against the `COMPLETE PROJECT SPECIFICATION` you provided. Below is a detailed breakdown of what is missing, what doesn't match the requirements, and what still needs to be built.

## 1. Initial Setup & Firebase Configuration
- **Firebase Initialization**: Missing `environment.ts` with real Firebase configuration.
- **Firebase Tools**: Currently, the app isn't hooked up to real Firebase. It relies on mock data and timeouts.

## 2. Data Models (Mismatch)
- **`src/app/models/expense.model.ts`**:
  - Properties like `userId` and `createdAt: Date` do not match the spec (should be `createdBy` and `createdAt: string`).
  - `ExpenseCategory` enum has extra values (`TRANSPORTATION`, etc.) instead of strictly: `FOOD`, `TRAVEL`, `OFFICE`, `UTILITIES`, `OTHER`.
  - `PaymentMode` enum is different.
  - `DailySummary` interface is implemented as `ExpenseSummary` and has different property names (`categoryTotals` instead of `totalsByCategory`).
- **`src/app/models/user.model.ts`**:
  - Implemented as `User` with an `id`, instead of `AppUser` with a `uid`.

## 3. Firestore Structure (Missing)
- **`firestore.rules`**: This file is completely missing from the root of the project. You need to create it and copy the exact rules from the spec.

## 4. Components & Folder Structure (Missing)
- **Shared Components**: `src/app/components/shared/confirm-dialog` and `src/app/components/shared/responsive-table` are entirely missing.
- **Data Test IDs**: You need to ensure all interactive elements in your existing components have the `data-test-id` attributes (e.g., `data-test-id="gl-add-expense-btn"`) for the Playwright tests.

## 5. Routing & App Config (Mismatch)
- **`app.routes.ts`**: The routes are structured as children under `dashboard` (e.g. `dashboard/expenses`), whereas the spec asks for them to be top-level routes protected by `authGuard` and `roleGuard`.
- **`app.config.ts`**: It currently uses older module-style providers (`importProvidersFrom(StoreModule.forRoot({}))`). It needs to be updated to use standalone Angular 18 providers like `provideFirebaseApp`, `provideFirestore`, `provideStore({ expenses: expenseReducer })`, etc., exactly as outlined in Section 6.

## 6. Firebase & Auth Services (Mocked, Needs Real Implementation)
- **`expense.service.ts`**: Currently returns mock data (`initializeMockData()`) using `BehaviorSubject`. It must be rewritten to use `@angular/fire/firestore` methods (`collectionSnapshots`, `addDoc`, `updateDoc`).
- **`auth.service.ts`**: Currently simulates login with `setTimeout` and local storage. It needs to be updated to use Firebase Authentication.

## 7. NgRx Store (Missing)
- The entire **`src/app/store/`** directory is missing.
- You need to create the `actions/expense.actions.ts`, `reducers/expense.reducer.ts`, `effects/expense.effects.ts`, and `selectors/expense.selectors.ts` files as specified.

## 8. Dexie Offline Cache (Mismatch)
- **`cache.service.ts`**: Implemented using a generic `CacheEntry` interface and a different database name (`greenledger_cache`). The spec requires a strictly defined `GreenLedgerDB` class with a `CachedExpense` interface.

## 9. Guards & Interceptors (Missing)
- **`role.guard.ts`**: Completely missing from `src/app/guards/`.
- **`auth-token.interceptor.ts`**: The `interceptors/` directory and the interceptor file are missing.

## 10. Encrypted Local Storage (Mismatch)
- **`storage.service.ts`**: Methods are named `setItem` and `getItem`. The spec strictly requires `setEncrypted` and `getDecrypted`, and the encryption key must be `GreenLedger2025`.

## 11. Cloud Functions (Missing)
- The **`functions/`** directory hasn't been initialized.
- Missing `generate-summary.ts` and `dailyAutoSummary.ts` for backend calculation.

## 12. Playwright E2E Tests (Missing)
- **`playwright.config.ts`**: Missing from the root.
- **`e2e/expense-tracker.spec.ts`**: The entire test suite and its 7 required scenarios are missing.

## 13. Bonus Features (Missing)
- PDF Export (`jspdf`)
- Toast notifications (`angular-toastify`)
- Category pie chart (`Chart.js` or `ngx-charts`)
- Custom `RouteReuseStrategy`
- Unit tests with Karma/Jasmine
