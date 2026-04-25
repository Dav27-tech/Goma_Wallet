import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      <!-- Logo / Header simplified -->
      <header class="p-8">
        <div class="flex items-center gap-2 justify-center md:justify-start">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <mat-icon class="text-white">account_balance_wallet</mat-icon>
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-800">Goma<span class="text-indigo-600">Wallet</span></span>
        </div>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        <div class="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-8">
          
          @if (!authService.isInitialized()) {
            <div class="flex flex-col items-center justify-center py-20 gap-4">
               <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <p class="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Initialisation...</p>
            </div>
          } @else {
            <div class="text-center animate-in fade-in duration-500">
              <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Bienvenue</h1>
              <p class="text-slate-500 font-medium">Reprenez le contrôle de votre argent dès aujourd'hui.</p>
            </div>

            @if (error()) {
              <div class="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1">
                <mat-icon class="text-sm">error_outline</mat-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <!-- Social Login -->
            <button 
              (click)="onGoogleLogin()"
              [disabled]="loading()"
              class="flex items-center justify-center gap-4 w-full py-4 px-6 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group disabled:opacity-50 disabled:pointer-events-none"
            >
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span class="font-bold text-slate-700">Continuer avec Google</span>
            </button>

            <div class="flex items-center gap-4 text-slate-300">
              <div class="flex-1 h-px bg-slate-100"></div>
              <span class="text-xs font-bold uppercase tracking-widest text-slate-400">ou</span>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>

            <!-- Email Login -->
            <form (submit)="onEmailLogin($event)" class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label for="email" class="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail</label>
                <div class="relative group">
                  <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">email</mat-icon>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    [value]="email()"
                    (input)="email.set($any($event.target).value)"
                    placeholder="votre@email.com" 
                    required
                    class="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                [disabled]="loading() || !email()"
                class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                @if (loading()) {
                  <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                } @else {
                  <span>Se connecter</span>
                  <mat-icon class="text-[18px] w-4 h-4 flex items-center justify-center">arrow_forward</mat-icon>
                }
              </button>
            </form>

            <p class="text-center text-xs text-slate-400 font-medium leading-relaxed px-4">
              En continuant, vous acceptez nos <a href="#" class="text-indigo-600 hover:underline">Conditions d'utilisation</a> et notre <a href="#" class="text-indigo-600 hover:underline">Politique de confidentialité</a>.
            </p>
          }
        </div>

        <button 
          routerLink="/"
          class="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
        >
          <mat-icon class="text-[18px] w-4 h-4 flex items-center justify-center">arrow_back</mat-icon>
          <span>Retour à l'accueil</span>
        </button>
      </main>


      <footer class="p-8 text-center text-[10px] uppercase tracking-widest text-slate-300 font-bold">
        GomaWallet &copy; 2026 - Mobile-first Finance
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  email = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async onGoogleLogin() {
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      this.error.set('Échec de la connexion Google. Veuillez réessayer.');
      this.loading.set(false);
    }
  }

  async onEmailLogin(event: Event) {
    event.preventDefault();
    if (!this.email()) return;
    
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.authService.loginWithEmail(this.email());
    } catch (err: any) {
      this.error.set(err.message || 'Une erreur est survenue.');
      this.loading.set(false);
    }
  }
}
