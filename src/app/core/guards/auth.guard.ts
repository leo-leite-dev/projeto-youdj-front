import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { SessionService } from '../auth/services/session.service';

function buildUrl(segments: UrlSegment[]): string {
    const path = segments.map(s => s.path).join('/');
    return '/' + path;
}

export const authGuard: CanMatchFn = (_route, segments) => {
    const router = inject(Router);
    const session = inject(SessionService);

    if (!session.isReadySnapshot()) {
        return true; 
    }

    if (session.isAuthenticatedSnapshot()) {
        return true;
    }

    const attempted = '/' + segments.map(s => s.path).join('/');

    return router.createUrlTree(['/login'], {
        queryParams: { redirect: attempted }
    });
};