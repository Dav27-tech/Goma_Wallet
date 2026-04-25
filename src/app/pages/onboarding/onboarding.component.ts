import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { AuthService } from '../../services/auth.service';
import { CurrencyCode } from '../../services/settings.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div class="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col gap-6">
        <div class="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
          <mat-icon class="text-3xl" style="width: 32px; height: 32px; font-size: 32px;">verified</mat-icon>
        </div>
        
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Presque prêt !</h1>
        <p class="text-slate-500 leading-relaxed font-medium px-4">
          C'est un plaisir de vous accueillir sur <strong>GomaWallet</strong>. 
          Choisissons votre devise principale pour commencer.
        </p>

        <div class="grid grid-cols-2 gap-3">
          @for (cur of currencies; track cur) {
            <button 
              (click)="selectedCurrency.set(cur)"
              [class.bg-indigo-600]="selectedCurrency() === cur"
              [class.text-white]="selectedCurrency() === cur"
              [class.bg-slate-50]="selectedCurrency() !== cur"
              class="py-4 rounded-2xl font-bold text-sm transition-all border border-slate-100 active:scale-95"
            >
              {{ cur }}
            </button>
          }
        </div>

        <button 
          (click)="finish()"
          [disabled]="loading()"
          class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          @if (loading()) {
            <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          } @else {
            <span>Terminer</span>
            <mat-icon class="text-[18px] w-4 h-4 flex items-center justify-center">check</mat-icon>
          }
        </button>
      </div>
    </div>
  `
})
export class OnboardingComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  currencies: CurrencyCode[] = ['USD', 'CDF', 'RWF', 'XOF'];
  selectedCurrency = signal<CurrencyCode>('USD');
  loading = signal(false);
  
  async finish() {
    const user = this.authService.currentUser();
    if (user) {
      this.loading.set(true);
      try {
        await updateDoc(doc(db, 'users', user.id), {
          isNewUser: false,
          currency: this.selectedCurrency()
        });
        this.router.navigate(['/app']);
      } catch (error) {
        console.error('Erreur lors de la finalisation de l\'onboarding:', error);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
