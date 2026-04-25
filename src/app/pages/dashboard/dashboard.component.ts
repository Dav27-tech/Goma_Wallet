import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { SettingsService, CurrencyCode } from '../../services/settings.service';
import { BudgetViewComponent } from './budget-view.component';
import { ExpensesViewComponent } from './expenses-view.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, BudgetViewComponent, ExpensesViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      <!-- Sidebar / Navigation -->
      <aside class="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div class="p-6 flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
            <mat-icon class="text-white text-[18px] w-4 h-4 flex items-center justify-center">account_balance_wallet</mat-icon>
          </div>
          <span class="font-bold text-xl tracking-tight text-slate-800">GomaWallet</span>
        </div>

        <nav class="flex-1 px-4 py-2 space-y-1">
          <button (click)="view.set('overview')" [class.bg-indigo-50]="view() === 'overview'" [class.text-indigo-600]="view() === 'overview'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold text-sm transition-all hover:bg-slate-50">
            <mat-icon class="text-[20px] w-5 h-5 flex items-center justify-center">dashboard</mat-icon>
            <span>Overview</span>
          </button>
          <button (click)="view.set('budget')" [class.bg-indigo-50]="view() === 'budget'" [class.text-indigo-600]="view() === 'budget'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold text-sm transition-all hover:bg-slate-50">
            <mat-icon class="text-[20px] w-5 h-5 flex items-center justify-center">pie_chart</mat-icon>
            <span>Budgets</span>
          </button>
          <button (click)="view.set('expenses')" [class.bg-indigo-50]="view() === 'expenses'" [class.text-indigo-600]="view() === 'expenses'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold text-sm transition-all hover:bg-slate-50">
            <mat-icon class="text-[20px] w-5 h-5 flex items-center justify-center">shopping_cart</mat-icon>
            <span>Dépenses</span>
          </button>
        </nav>

        <div class="p-4 border-t border-slate-100">
          <div class="bg-slate-50 p-4 rounded-2xl">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Devise</p>
            <div class="flex gap-1">
              @for (cur of currencies; track cur) {
                <button 
                  (click)="settings.setCurrency(cur)"
                  [class.bg-white]="settings.currency() === cur"
                  [class.shadow-sm]="settings.currency() === cur"
                  [class.text-indigo-600]="settings.currency() === cur"
                  class="flex-1 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 transition-all border border-transparent"
                >
                  {{ cur }}
                </button>
              }
            </div>
          </div>
          
          <button (click)="logout()" class="w-full mt-4 flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors">
            <mat-icon class="text-[20px] w-5 h-5 flex items-center justify-center">logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6 md:p-10 overflow-auto">
        @if (view() === 'overview') {
          <div class="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Bonjour, {{ (auth.currentUser())?.displayName }}</h1>
              <p class="text-slate-500 font-medium">Voici l'état de vos finances pour ce mois.</p>
            </header>

            @if (!data.activeBudget()) {
              <div class="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 text-center space-y-4">
                <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="text-3xl" style="width: 32px; height: 32px; font-size: 32px;">calendar_today</mat-icon>
                </div>
                <h2 class="text-2xl font-bold text-slate-900">Aucun budget actif</h2>
                <p class="text-slate-500 max-w-sm mx-auto">Commencez par créer votre premier budget pour suivre vos dépenses.</p>
                <button (click)="view.set('budget')" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                  Créer mon budget
                </button>
              </div>
            } @else {
              <!-- Dashboard Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 text-white flex flex-col justify-between h-48 group hover:-translate-y-1 transition-all">
                  <p class="text-xs font-bold uppercase tracking-widest opacity-80">Solde Restant</p>
                  <p class="text-4xl font-extrabold tracking-tight text-ellipsis overflow-hidden">{{ dashboardStats().remaining | number:'1.0-0' }} {{ settings.currencySymbol() }}</p>
                  <div class="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-4">
                    <div class="h-full bg-white transition-all duration-1000" [style.width.%]="dashboardStats().percent"></div>
                  </div>
                </div>

                <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-48 lg:border-indigo-100 lg:shadow-md">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Budget Alloué</p>
                  <p class="text-3xl font-extrabold text-slate-900 tracking-tight text-ellipsis overflow-hidden">{{ dashboardStats().total | number:'1.0-0' }} {{ settings.currencySymbol() }}</p>
                  <div class="flex items-center gap-2 text-indigo-600">
                    <mat-icon class="text-sm">analytics</mat-icon>
                    <span class="text-xs font-bold">{{ data.activeBudget()?.type === '50/30/20' ? 'Règle 50/30/20' : 'Budget Personnel' }}</span>
                  </div>
                </div>

                <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-48">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Dépenses Totales</p>
                  <p class="text-3xl font-extrabold text-slate-900 tracking-tight text-ellipsis overflow-hidden">{{ dashboardStats().spent | number:'1.0-0' }} {{ settings.currencySymbol() }}</p>
                  <div class="flex items-center gap-2 text-rose-500">
                    <mat-icon class="text-sm">trending_up</mat-icon>
                    <span class="text-xs font-bold">{{ dashboardStats().spentCount }} transactions</span>
                  </div>
                </div>
              </div>

              <!-- Mini Categories -->
               <div class="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                <h3 class="text-xl font-bold text-slate-800">Répartition par catégorie</h3>
                <div class="space-y-4">
                  @for (cat of data.activeBudget()?.categories; track cat.name) {
                    <div class="space-y-1">
                      <div class="flex justify-between text-sm font-bold">
                        <span class="text-slate-600">{{ cat.name }}</span>
                        <span class="text-slate-900">{{ getCatSpent(cat.name) | number:'1.0-0' }} / {{ cat.allocated | number:'1.0-0' }} {{ settings.currencySymbol() }}</span>
                      </div>
                      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 transition-all duration-1000" [style.width.%]="getCatPercent(cat.name, cat.allocated)"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        @if (view() === 'budget') {
          <app-budget-view></app-budget-view>
        }

        @if (view() === 'expenses') {
          <app-expenses-view></app-expenses-view>
        }
      </main>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  settings = inject(SettingsService);
  
  view = signal<'overview' | 'budget' | 'expenses'>('overview');
  currencies: CurrencyCode[] = ['USD', 'CDF', 'RWF', 'XOF'];

  dashboardStats = computed(() => {
    const budget = this.data.activeBudget();
    const expenses = this.data.expenses();
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAllocated = budget?.categories.reduce((sum, c) => sum + c.allocated, 0) || 0;
    const remaining = totalAllocated - spent;
    const percent = totalAllocated > 0 ? (remaining / totalAllocated) * 100 : 0;
    
    return {
      total: totalAllocated,
      spent,
      remaining,
      spentCount: expenses.length,
      percent: Math.max(0, Math.min(100, percent))
    };
  });

  getCatSpent(name: string) {
    return this.data.expenses().filter(e => e.category === name).reduce((sum, e) => sum + e.amount, 0);
  }

  getCatPercent(name: string, allocated: number) {
    if (allocated === 0) return 0;
    return Math.min(100, (this.getCatSpent(name) / allocated) * 100);
  }

  logout() {
    this.auth.logout();
  }

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.data.loadData();
      }
    });
  }
}

