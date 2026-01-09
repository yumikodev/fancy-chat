import { inject, Injectable } from '@angular/core';
import {
  createClient,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
  SupabaseClient,
} from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  readonly #config = inject(SUPABASE_CONFIG);
  readonly #supabase: SupabaseClient;

  constructor() {
    this.#supabase = createClient(this.#config.url, this.#config.key);
  }

  setupRoom(id: string, username: string) {
    const channel = this.#supabase.channel(`room:${id}`, {
      config: {
        presence: { enabled: true, key: username },
      },
    });

    channel
      .on('presence', { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN }, ({ key }) => {
        console.log(`[System]: ${key} entró a la sala`);
      })
      .on('presence', { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE }, ({ key }) => {
        console.log(`[System]: ${key} salió de la sala`);
      });

    // Subscription & activation
    channel.subscribe(async (status) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        console.log('[WS] Connected');
        await channel.track({
          online_at: new Date().toISOString(),
          username,
        });
      }
    });

    return channel;
  }

  sendMessage(
    channel: RealtimeChannel,
    content: {
      message: string;
      username: string;
      temporalId: string;
    }
  ) {
    channel.httpSend('new-message', {
      ...content,
      timestamp: new Date().toISOString(),
    });
  }
}
