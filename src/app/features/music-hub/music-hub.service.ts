import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { YoutubeSearchResult, YoutubeVideo } from './music-hub.models';
import { environment } from '../environments/environments';

@Injectable({ providedIn: 'root' })
export class MusicHubService {
    private readonly api = `${environment.apiBaseUrl}/youtube`;
    private readonly http = inject(HttpClient);

    searchMusic(term: string): Observable<YoutubeVideo[]> {
        const params = new HttpParams()
            .set('term', term)
            .set('limit', 10);  

        return this.http
            .get<YoutubeSearchResult>(`${this.api}/search`, { params })
            .pipe(
                map(res => res.items),
            );
    }
}