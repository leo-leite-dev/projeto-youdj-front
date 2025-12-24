import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { MusicControlPanel } from './features/music-control-panel/music-control-panel';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'login',
        component: HomeComponent,
    },
    {
        path: 'music-control-panel',
        canMatch: [authGuard],
        component: MusicControlPanel,
    },
    {
        path: '**',
        redirectTo: '',
    },
];