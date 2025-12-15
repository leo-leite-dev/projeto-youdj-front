import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { MusicHubComponent } from './features/music-hub/music-hub';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'music',
        component: MusicHubComponent,
    },
    {
        path: '**',
        redirectTo: '',
    },
];