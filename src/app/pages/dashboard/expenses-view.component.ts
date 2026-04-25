import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService, Expense } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expenses-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Dépenses</h1>
          <p class="text-slate-500 font-medium">Historique de vos sorties d'argent.</p>
        </div>
        
        <div class="flex gap-4">
           <div class="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
             <mat-icon class="text-slate-400 text-sm">filter_list</mat-icon>
             <select #catFilter (change)="categoryFilter.set(catFilter.value)" class="bg-transparent text-sm font-bold text-slate-600 focus:outline-none">
               <option value="">Toutes catégories</option>
               @for (cat of availableCategories(); track cat) {
                 <option [value]="cat">{{ cat }}</option>
               }
             </select>
           </div>
        </div>
      </header>

      <!-- FAB for Mobile -->
      <button 
        (click)="showAddExpense.set(true)"
        class="fixed bottom-8 right-8 z-50 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:hidden"
      >
        <mat-icon class="text-3xl">add</mat-icon>
      </button>

      <!-- FAB for Desktop trigger if desired -->
      <div class="hidden md:flex justify-end">
        <button (click)="showAddExpense.set(true)" class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
           <mat-icon>add</mat-icon>
           <span>Enregistrer une dépense</span>
        </button>
      </div>

      <!-- Add Expense Modal -->
      @if (showAddExpense()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                 <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <mat-icon>receipt_long</mat-icon>
                 </div>
                 <h2 class="text-2xl font-extrabold text-slate-800">Ajouter une dépense</h2>
              </div>
              <button (click)="showAddExpense.set(false)" class="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <form (submit)="saveExpense($event, amount.value, category.value, note.value, method.value)" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Montant</label>
                  <div class="relative">
                    <input #amount type="number" required placeholder="0.00" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 pl-14">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">{{ settings.currencySymbol() }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Catégorie</label>
                  <select #category class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none appearance-none">
                    @for (cat of availableCategories(); track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Note / Libellé</label>
                <input #note type="text" required placeholder="Ex: Courses mensuelles" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none">
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Moyen de paiement</label>
                <div class="grid grid-cols-3 gap-2">
                   @for (m of ['Cash', 'Mobile Money', 'Banque']; track m) {
                     <button type="button" (click)="paymentMethod.set(m)" [class.bg-indigo-600]="paymentMethod() === m" [class.text-white]="paymentMethod() === m" class="py-3 rounded-xl font-bold text-xs bg-slate-100 text-slate-500 transition-all">
                       {{ m }}
                     </button>
                   }
                </div>
                <input #method type="hidden" [value]="paymentMethod()">
              </div>

              <button type="submit" class="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98]">
                Enregistrer la dépense
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Expenses Table -->
      <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left font-sans">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th class="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Libellé</th>
                <th class="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Catégorie</th>
                <th class="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Méthode</th>
                <th class="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (exp of filteredExpenses(); track exp.id) {
                <tr class="hover:bg-slate-50/20 transition-all group">
                  <td class="px-8 py-6">
                    <p class="font-bold text-slate-900">{{ formatDate(exp.date) }}</p>
                  </td>
                  <td class="px-8 py-6">
                    <p class="font-bold text-slate-700">{{ exp.note }}</p>
                  </td>
                  <td class="px-8 py-6">
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-extrabold uppercase tracking-tight">
                      {{ exp.category }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    <span class="text-xs font-bold text-slate-400">{{ exp.paymentMethod }}</span>
                  </td>
                  <td class="px-8 py-6 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <p class="font-extrabold text-slate-900 text-lg">{{ exp.amount | number:'1.2-2' }} <span class="text-slate-400 text-xs">{{ settings.currencySymbol() }}</span></p>
                      <button (click)="data.deleteExpense(exp.id!)" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-8 py-20 text-center space-y-4">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <mat-icon class="text-4xl">receipt_long</mat-icon>
                    </div>
                    <p class="text-slate-400 font-medium font-sans">Aucune dépense enregistrée.</p>
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
export class ExpensesViewComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  settings = inject(SettingsService);
  
  showAddExpense = signal(false);
  paymentMethod = signal<string>('Cash');
  categoryFilter = signal<string>('');

  availableCategories = computed(() => {
    return this.data.activeBudget()?.categories.map(c => c.name) || [];
  });

  filteredExpenses = computed(() => {
    const expenses = this.data.expenses();
    const filter = this.categoryFilter();
    if (!filter) return expenses;
    return expenses.filter(e => e.category === filter);
  });

  formatDate(d: any) {
    if (!d) return '';
    const date = d.toDate ? d.toDate() : new Date(d);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);
  }

  async saveExpense(event: Event, amount: string, category: string, note: string, method: string) {
    event.preventDefault();
    const user = this.auth.currentUser();
    if (!user || !this.data.activeBudget()) return;

    try {
      await this.data.addExpense({
        userId: user.id,
        budgetId: this.data.activeBudget()!.id!,
        amount: parseFloat(amount),
        category,
        note,
        paymentMethod: method as any,
        date: new Date()
      });
      this.showAddExpense.set(false);
    } catch (err) {
      // Handled by DataService
    }
  }
}
