import { InjectionToken } from '@angular/core';

export interface SupabaseConfig {
  url: string;
  key: string;
}

export const SUPABASE_CONFIG = new InjectionToken<SupabaseConfig>('supabase.config');
