import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  serverTimestamp,
  Timestamp,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { AuthService } from './auth.service';
import { handleFirestoreError, OperationType } from '../utils/firestore-error';

export interface BudgetCategory {
  name: string;
  allocated: number;
}

export interface Budget {
  id?: string;
  userId: string;
  month: number;
  year: number;
  status: 'active' | 'inactive';
  type: 'personal' | '50/30/20';
  categories: BudgetCategory[];
  createdAt: any;
}

export interface Expense {
  id?: string;
  userId: string;
  budgetId: string;
  amount: number;
  category: string;
  date: any;
  paymentMethod: 'Cash' | 'Mobile Money' | 'Banque';
  note: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private authService = inject(AuthService);
  
  budgets = signal<Budget[]>([]);
  expenses = signal<Expense[]>([]);
  activeBudget = signal<Budget | null>(null);

  private budgetsUnsubscribe: Unsubscribe | null = null;
  private expensesUnsubscribe: Unsubscribe | null = null;

  constructor() {
    this.initListeners();
  }

  ngOnDestroy() {
    this.stopListeners();
  }

  private initListeners() {
    // Handled via loadData in dashboard
  }

  stopListeners() {
    if (this.budgetsUnsubscribe) {
      this.budgetsUnsubscribe();
      this.budgetsUnsubscribe = null;
    }
    if (this.expensesUnsubscribe) {
      this.expensesUnsubscribe();
      this.expensesUnsubscribe = null;
    }
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.stopListeners();

    // Listen to budgets
    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('userId', '==', user.id),
      orderBy('year', 'desc'),
      orderBy('month', 'desc')
    );

    this.budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const bList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Budget));
      this.budgets.set(bList);
      
      const active = bList.find(b => b.status === 'active') || bList[0] || null;
      this.activeBudget.set(active);

      if (active) {
        this.loadExpenses(active.id!);
      } else {
        this.expenses.set([]);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });
  }

  private loadExpenses(budgetId: string) {
    const user = this.authService.currentUser();
    if (!user) return;

    if (this.expensesUnsubscribe) {
      this.expensesUnsubscribe();
    }

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.id),
      where('budgetId', '==', budgetId),
      orderBy('date', 'desc')
    );

    this.expensesUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      this.expenses.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `expenses for budget ${budgetId}`);
    });
  }

  async addBudget(budget: Omit<Budget, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'budgets'), {
        ...budget,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
      throw error;
    }
  }

  async setBudgetStatus(budgetId: string, status: 'active' | 'inactive') {
    try {
      return await updateDoc(doc(db, 'budgets', budgetId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `budgets/${budgetId}`);
      throw error;
    }
  }

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'expenses'), {
        ...expense,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
      throw error;
    }
  }

  async deleteExpense(expenseId: string) {
    try {
      return await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${expenseId}`);
      throw error;
    }
  }
}
