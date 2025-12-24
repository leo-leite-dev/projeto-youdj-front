import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environments";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { PlayNowRequest } from "../contracts/player-now-request";
import { CurrentPlayingResponse } from "../contracts/current-playing-response";

@Injectable({ providedIn: "root" })
export class PlayerService {

    private readonly api = `${environment.apiBaseUrl}/player`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    playNow(payload: PlayNowRequest): Observable<void> {
        return this.http
            .post<void>(`${this.api}/play-now`, payload)
            .pipe(this.errors.rxThrow<void>("PlayerService.playNow"));
    }

    getCurrent(djId: string): Observable<CurrentPlayingResponse | null> {
        return this.http
            .get<CurrentPlayingResponse | null>(
                `${this.api}/current`,
                { params: { djId } }
            )
            .pipe(this.errors.rxThrow("PlayerService.getCurrent"));
    }

    playFirstFromQueue(djId: string): Observable<void> {
        return this.http
            .post<void>(
                `${this.api}/play-from-queue`,
                {},
                { params: { djId } }
            )
            .pipe(this.errors.rxThrow("PlayerService.playFirstFromQueue"));
    }

    finishPlaying(): Observable<void> {
        return this.http
            .post<void>(`${this.api}/finish-playing`, {})
            .pipe(this.errors.rxThrow("PlayerService.finishPlaying"));
    }
}