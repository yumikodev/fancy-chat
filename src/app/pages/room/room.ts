import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Field, form, required } from '@angular/forms/signals';
import { ChevronLeftIcon, LucideAngularModule } from 'lucide-angular';
import { Supabase } from '../../common/services/supabase';
import { StorageManager } from '../../common/services/storage-manager';
import { REALTIME_PRESENCE_LISTEN_EVENTS, RealtimeChannel } from '@supabase/supabase-js';
import { IMessage, MessageBuilder, SystemMessageBuilder } from './models/message';
import { DatePipe } from '@angular/common';
import { StringColorPipe } from '../../common/pipes/string-color-pipe';

@Component({
  selector: 'app-room',
  imports: [LucideAngularModule, Field, DatePipe, StringColorPipe],
  templateUrl: './room.html',
})
export default class Room {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #supabase = inject(Supabase);
  readonly #storageManager = inject(StorageManager);
  readonly #paramsSignal = toSignal(this.#route.paramMap, { requireSync: true });
  readonly #channel: RealtimeChannel;
  readonly roomId = computed(() => this.#paramsSignal().get('roomId') || 'Desconocida');
  readonly icons = {
    exit: ChevronLeftIcon,
  };
  readonly messageModel = signal({
    content: '',
  });
  readonly messageForm = form(this.messageModel, (schemaPath) => {
    required(schemaPath.content);
  });
  readonly temporalId = signal(crypto.randomUUID());
  readonly username = signal('');
  readonly onlineCount = signal(0);
  readonly chatHistory = signal<IMessage[]>([]);
  readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  constructor() {
    this.#channel = this.#supabase.setupRoom(this.roomId(), this.#storageManager.getUsername()!);
    this.username.set(this.#storageManager.getUsername()!);
    this.handleEvents();

    effect(() => {
      document.title = `Sala: ${this.roomId()} - FancyChat`;
    });

    effect(() => {
      const chat = this.chatHistory();
      const lastMessage = chat.at(-1);
      const myself = lastMessage && lastMessage.temporalId === this.temporalId();
      const container = this.scrollContainer()?.nativeElement;

      if (container) {
        setTimeout(() => {
          const isAtBottom =
            container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
          if (isAtBottom || myself) {
            this.scrollToBotton(container);
          }
        }, 0);
      }
    });
  }

  scrollToBotton(container: HTMLDivElement) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }

  handleEvents() {
    this.#channel
      .on('presence', { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN }, ({ key }) => {
        this.onlineCount.update((c) => c + 1);
        this.chatHistory.update((chat) => [
          ...chat,
          new SystemMessageBuilder([`${key} ingresó a la sala`], new Date()),
        ]);
      })
      .on('presence', { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE }, ({ key }) => {
        this.onlineCount.update((c) => c - 1);
        this.chatHistory.update((chat) => [
          ...chat,
          new SystemMessageBuilder([`${key} abandonó la sala`], new Date()),
        ]);
      })
      .on(
        'broadcast',
        {
          event: 'new-message',
        },
        ({ payload }) => {
          this.chatHistory.update((chat) => {
            const lastMessage = chat.at(-1);
            const myMessage =
              lastMessage &&
              lastMessage.type === 'MESSAGE' &&
              lastMessage.temporalId === payload.temporalId;

            if (myMessage) {
              lastMessage.content.push(payload.message);
              chat.pop();
              return [...chat, lastMessage];
            }

            return [
              ...chat,
              new MessageBuilder(
                payload.temporalId,
                payload.username,
                [payload.message],
                new Date(payload.timestamp)
              ),
            ];
          });
        }
      );
  }

  handleSendMessage(e: Event) {
    e.preventDefault();
    const { content } = this.messageForm().value();
    this.#supabase.sendMessage(this.#channel, {
      message: content,
      username: this.username(),
      temporalId: this.temporalId(),
    });
    this.messageForm().value.set({ content: '' });
  }

  async handleExit() {
    await this.#channel.unsubscribe();
    this.#router.navigateByUrl('/');
  }
}
