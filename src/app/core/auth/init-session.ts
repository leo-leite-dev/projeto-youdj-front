import { firstValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';

export function initSession(
    auth: AuthService,
    session: SessionService
) {
    return async () => {
        try {
            const user = await firstValueFrom(auth.me());

            if (!user) {
                session.clear();
                return;
            }

            session.refresh(user);
        } catch {
            session.clear();
        }
    };
}