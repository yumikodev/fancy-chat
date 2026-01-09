import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageManager {
  setUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  hasUsername(): boolean {
    return !!this.getUsername();
  }
}
