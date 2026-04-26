import { Injectable, signal, computed } from '@angular/core';

export interface ExchangeRates {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  // Taux de change par défaut par rapport à l'USD (Base)
  // Note: En production, ces taux devraient être récupérés via le serveur MCP ou une API.
  private rates = signal<ExchangeRates>({
    'USD': 1,
    'CDF': 2800,
    'RWF': 1250,
    'XOF': 600
  });

  constructor() {}

  // Convertit un montant d'une devise à une autre
  convert(amount: number, from: string, to: string): number {
    const currentRates = this.rates();
    if (!currentRates[from] || !currentRates[to]) return amount;
    
    // Conversion via l'USD comme base
    const amountInUsd = amount / currentRates[from];
    return amountInUsd * currentRates[to];
  }

  getRate(currency: string): number {
    return this.rates()[currency] || 1;
  }

  updateRates(newRates: ExchangeRates) {
    this.rates.set({ ...this.rates(), ...newRates });
  }
}
