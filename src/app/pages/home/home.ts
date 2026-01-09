import { Component, inject, signal } from '@angular/core';
import { Field, form, pattern, required } from '@angular/forms/signals';
import { StorageManager } from '../../common/services/storage-manager';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Field],
  templateUrl: './home.html',
})
export default class Home {
  readonly #storageManager = inject(StorageManager);
  readonly #router = inject(Router);

  formModel = signal({
    username: '',
    roomId: '',
  });
  loginForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.username, { message: 'El nombre de usuario es requerido.' });
    required(schemaPath.roomId, { message: 'Debes ingresar la ID de la sala a unirte.' });
    pattern(schemaPath.username, /^\w+$/, {
      message: 'El nombre de usuario debe ser alfanumérico.',
    });
    pattern(schemaPath.roomId, /^\w+$/, {
      message: 'El ID solo puede contener los siguientes carácteres: a-z, A-Z, _.',
    });
  });

  constructor() {
    const username = this.#storageManager.getUsername();
    if (username) {
      this.formModel.set({ username, roomId: '' });
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();

    const { username, roomId } = this.formModel();

    this.#storageManager.setUsername(username);
    this.#router.navigateByUrl(`/room/${roomId}`);
  }
}
