import { Routes } from '@angular/router';
import { roomGuard } from './common/guards/room-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home'),
    title: 'Inicio - FancyChat',
  },
  {
    path: 'room/:roomId',
    loadComponent: () => import('./pages/room/room'),
    title: 'Sala - FancyChat',
    canActivate: [roomGuard],
  },
  {
    path: "**",
    redirectTo: "",
    pathMatch: "full"
  }
];
