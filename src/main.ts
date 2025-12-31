import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { registerIcons } from './shareds/icons/fontawesome.icon';
import { initSession } from './app/core/auth/init-session';
import { AuthService } from './app/core/auth/services/auth.service';
import { SessionService } from './app/core/auth/services/session.service';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...appConfig.providers,

    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initSession,
      deps: [AuthService, SessionService],
    },

    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (library: FaIconLibrary) => {
        return () => registerIcons(library);
      },
      deps: [FaIconLibrary],
    },
  ],
}).catch(err => console.error(err));