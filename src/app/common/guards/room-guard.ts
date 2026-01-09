import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageManager } from '../services/storage-manager';

export const roomGuard: CanActivateFn = () => {
  const storageManager = inject(StorageManager);
  const router = inject(Router);

  if (!storageManager.hasUsername()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
