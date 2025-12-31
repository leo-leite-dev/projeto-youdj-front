import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environments";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { AddMusicToQueueRequest } from "../contracts/add-music-to-queue-request";
import { QueueItem } from "../models/queue-item.mode";
import { ReorderQueueRequest } from "../contracts/recorder-queue-request";

@Injectable({ providedIn: "root" })
export class QueueService {

    private readonly api = `${environment.apiBaseUrl}/queue`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    private readonly queueSubject = new BehaviorSubject<QueueItem[]>([]);

    readonly queue$ = this.queueSubject.asObservable();

    loadQueue(): void {
        this.http
            .get<QueueItem[]>(this.api)
            .pipe(this.errors.rxThrow<QueueItem[]>("QueueService.getQueue"))
            .subscribe(queue => this.queueSubject.next(queue));
    }

    addMusic(payload: AddMusicToQueueRequest): Observable<void> {
        return this.http
            .post<void>(this.api, payload)
            .pipe(
                this.errors.rxThrow<void>("QueueService.addMusic"),
                tap(() => this.loadQueue())
            );
    }

    reorderQueue(from: number, to: number): void {
        const currentQueue = [...this.queueSubject.value];

        const [moved] = currentQueue.splice(from, 1);
        currentQueue.splice(to, 0, moved);

        const payload: ReorderQueueRequest = {
            items: currentQueue.map((item, index) => ({
                queueItemId: item.id,
                position: index
            }))
        };

        this.queueSubject.next(
            currentQueue.map((item, index) => ({
                ...item,
                position: index
            }))
        );

        this.http
            .put<void>(`${this.api}/reorder`, payload)
            .pipe(this.errors.rxThrow<void>("QueueService.reorderQueue"))
            .subscribe({
                error: () => {
                    this.loadQueue();
                }
            });
    }
}