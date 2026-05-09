export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;           // YYYY-MM-DD
  paymentMode: PaymentMode;
  createdBy: string;      // Firebase Auth UID
  createdAt: string;      // ISO timestamp
  updatedAt?: string;
  isDeleted?: boolean;    // soft delete flag
}

export enum ExpenseCategory {
  FOOD = 'Food',
  TRAVEL = 'Travel',
  OFFICE = 'Office',
  UTILITIES = 'Utilities',
  OTHER = 'Other'
}

export enum PaymentMode {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card'
}

export interface ExpenseFilter {
  searchText: string;
  category: ExpenseCategory | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface DailySummary {
  date: string;
  totalsByCategory: Record<string, number>;
  grandTotal: number;
  generatedAt: string;
}
