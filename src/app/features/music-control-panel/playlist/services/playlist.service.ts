import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { ErrorHandlingService } from "../../../../shared/services/error-handling.service";
import { AddPlaylistItemRequest } from "../contracts/add-playlist-item-request";
import { CreatePlaylistFolderRequest } from "../contracts/create-playlist-folder-request";
import { PlaylistFolder } from "../models/playlist-folder";
import { PlaylistItem } from "../models/playlist-item";

@Injectable({ providedIn: "root" })
export class PlaylistService {

    private readonly api = `${environment.apiBaseUrl}/dj/playlist`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    private readonly foldersSubject = new BehaviorSubject<PlaylistFolder[]>([]);
    private readonly itemsSubject = new BehaviorSubject<PlaylistItem[]>([]);

    readonly folders$ = this.foldersSubject.asObservable();
    readonly items$ = this.itemsSubject.asObservable();

    loadFolders(playlistId: string): void {
        this.http
            .get<PlaylistFolder[]>(`${this.api}/folder`, { 
                params: { playlistId }
            })
            .pipe(this.errors.rxThrow<PlaylistFolder[]>("PlaylistService.loadFolders"))
            .subscribe(folders => this.foldersSubject.next(folders));
    }

    loadItems(playlistId: string, folderId?: string): void {
        const params: { playlistId: string; folderId?: string } = { playlistId };

        if (folderId)
            params.folderId = folderId;

        this.http
            .get<PlaylistItem[]>(`${this.api}/items`, { params })
            .pipe(this.errors.rxThrow<PlaylistItem[]>("PlaylistService.loadItems"))
            .subscribe(items => this.itemsSubject.next(items));
    }

    addItem(payload: AddPlaylistItemRequest): Observable<void> {
        return this.http
            .post<void>(`${this.api}/item`, payload)
            .pipe(
                this.errors.rxThrow<void>("PlaylistService.addItem"),
                tap(() => {
                    this.loadItems(payload.playlistId, payload.folderId);
                })
            );
    }

    createFolder(payload: CreatePlaylistFolderRequest): Observable<void> {
        return this.http
            .post<void>(`${this.api}/folder`, payload)
            .pipe(
                this.errors.rxThrow<void>("PlaylistService.createFolder"),
                tap(() => this.loadFolders(payload.playlistId))
            );
    }
}