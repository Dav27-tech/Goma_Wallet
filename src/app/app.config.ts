import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners, isDevMode,
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeFirestore, provideFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => initializeFirestore(provideFirebaseApp() as any, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    }, firebaseConfig.firestoreDatabaseId)),
    provideStorage(() => getStorage()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
};
