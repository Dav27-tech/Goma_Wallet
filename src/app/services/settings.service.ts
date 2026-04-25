import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { AuthService } from './auth.service';

export type CurrencyCode = 'USD' | 'CDF' | 'RWF' | 'XOF';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  'USD': '$',
  'CDF': 'FC',
  'RWF': 'RF',
  'XOF': 'F'
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private authService = inject(AuthService);
  
  currency = signal<CurrencyCode>('USD');
  currencySymbol = computed(() => CURRENCY_SYMBOLS[this.currency()]);

  constructor() {
    // Sync settings with user profile if it exists
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.currency) {
        this.currency.set(user.currency as CurrencyCode);
      }
    }, { allowSignalWrites: true });
  }

  async setCurrency(code: CurrencyCode) {
    this.currency.set(code);
    const user = this.authService.currentUser();
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          currency: code
        });
      } catch (error) {
        console.error('Failed to update currency in Firestore:', error);
      }
    }
  }
}
