import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { SUPABASE_CONFIG } from './common/config/supabase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {
      provide: SUPABASE_CONFIG,
      useFactory: () => ({
        url: (window as any).env?.SUPABASE_URL || '',
        key: (window as any).env?.SUPABASE_KEY || '',
      }),
    },
  ],
};
