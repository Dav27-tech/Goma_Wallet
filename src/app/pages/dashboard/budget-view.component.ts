import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService, Budget } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-budget-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Mes Budgets</h1>
          <p class="text-slate-500 font-medium">Gérez vos limites de dépenses mensuelles.</p>
        </div>
        <div class="flex gap-2">
           <button (click)="showNewBudgetForm.set(true)" class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <mat-icon class="text-[18px] w-4 h-4 flex items-center justify-center">add</mat-icon>
              <span>Nouveau budget</span>
           </button>
           @if (data.budgets().length > 0) {
             <button (click)="duplicateLastBudget()" class="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                <mat-icon class="text-[18px] w-4 h-4 flex items-center justify-center">content_copy</mat-icon>
                <span>Dupliquer le dernier</span>
             </button>
           }
        </div>
      </header>

      @if (showNewBudgetForm()) {
        <div class="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
           <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold text-slate-900">Nouveau Budget Mensuel</h3>
              <button (click)="showNewBudgetForm.set(false)" class="text-slate-400 hover:text-slate-600">
                <mat-icon>close</mat-icon>
              </button>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 pl-1">Type de budget</label>
                <select #budgetType class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="personal">Personnel (Sur mesure)</option>
                  <option value="50/30/20">Règle 50/30/20 (Besoins, Envies, Épargne)</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 pl-1">Montant total estimé</label>
                <div class="relative">
                  <input #totalAmount type="number" placeholder="0" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pl-12">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{{ settings.currencySymbol() }}</span>
                </div>
              </div>
           </div>

           <button (click)="createNewBudget(budgetType.value, +totalAmount.value)" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">
             Créer le budget de {{ currentMonthName }}
           </button>
        </div>
      }

      <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Statut</th>
                <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (budget of data.budgets(); track budget.id) {
                <tr class="hover:bg-slate-50/50 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                        {{ getMonthShort(budget.month) }}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900">{{ getMonthName(budget.month) }}</p>
                        <p class="text-xs font-medium text-slate-400">{{ budget.year }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                    <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {{ budget.type === '50/30/20' ? 'Règle 50/30/20' : 'Sur mesure' }}
                    </span>
                  </td>
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-2">
                       <span [class]="budget.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'" class="w-2 h-2 rounded-full"></span>
                       <span class="text-sm font-bold" [class.text-emerald-600]="budget.status === 'active'" [class.text-slate-500]="budget.status === 'inactive'">
                          {{ budget.status === 'active' ? 'Actif' : 'Inactif' }}
                       </span>
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right">
                    @if (budget.status !== 'active') {
                      <button (click)="activateBudget(budget.id!)" class="text-indigo-600 font-bold text-sm hover:underline">
                        Activer
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-8 py-12 text-center text-slate-400 font-medium italic">
                    Aucun budget trouvé. Créez-en un pour commencer.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BudgetViewComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  settings = inject(SettingsService);
  
  showNewBudgetForm = signal(false);

  get currentMonthName() {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());
  }

  getMonthName(m: number) {
     return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(2024, m));
  }

  getMonthShort(m: number) {
    return new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(new Date(2024, m)).replace('.', '');
  }

  async createNewBudget(type: string, amount: number) {
    const now = new Date();
    const user = this.auth.currentUser();
    if (!user) return;

    const categories = type === '50/30/20' ? [
      { name: 'Besoins', allocated: amount * 0.5 },
      { name: 'Envies', allocated: amount * 0.3 },
      { name: 'Épargne', allocated: amount * 0.2 }
    ] : [
      { name: 'Alimentation', allocated: amount * 0.4 },
      { name: 'Loisirs', allocated: amount * 0.2 },
      { name: 'Transport', allocated: amount * 0.2 },
      { name: 'Santé', allocated: amount * 0.2 }
    ];

    try {
      await this.data.addBudget({
        userId: user.id,
        month: now.getMonth(),
        year: now.getFullYear(),
        status: 'active',
        type: type as any,
        categories
      });
      this.showNewBudgetForm.set(false);
    } catch (err) {
      // Error handled by DataService
    }
  }

  async duplicateLastBudget() {
    const last = this.data.budgets()[0];
    if (!last) return;

    const nextMonth = (last.month + 1) % 12;
    const nextYear = last.month === 11 ? last.year + 1 : last.year;

    await this.data.addBudget({
      userId: last.userId,
      month: nextMonth,
      year: nextYear,
      status: 'inactive',
      type: last.type,
      categories: last.categories.map(c => ({ ...c }))
    });
  }

  async activateBudget(id: string) {
    // Basic logic: deactivate currently active then activate this one
    const active = this.data.budgets().find(b => b.status === 'active');
    if (active) {
      await this.data.setBudgetStatus(active.id!, 'inactive');
    }
    await this.data.setBudgetStatus(id, 'active');
  }
}
