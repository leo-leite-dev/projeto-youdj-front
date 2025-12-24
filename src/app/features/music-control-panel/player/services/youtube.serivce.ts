import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class YouTubeService {

  private apiReady$ = new ReplaySubject<void>(1);
  private loading = false;

  loadApi() {
    if (window.YT?.Player) {
      this.apiReady$.next();
      return this.apiReady$;
    }

    if (!this.loading) {
      this.loading = true;

      window.onYouTubeIframeAPIReady = () => {
        this.apiReady$.next();
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    return this.apiReady$;
  }
}