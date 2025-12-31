import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ErrorHandlingService } from "./error-handling.service";
import { environment } from "../../../environments/environments";

export interface GenerateDjExtensionResponse {
    url: string;
}

@Injectable({ providedIn: "root" })
export class DjExtensionService {

    private readonly api = `${environment.apiBaseUrl}/dj/playlist`;

    private http = inject(HttpClient);
    private errors = inject(ErrorHandlingService);

    generateLink(): Observable<GenerateDjExtensionResponse> {
        return this.http
            .post<GenerateDjExtensionResponse>(
                `${this.api}/dj-extension`,
                {}
            )
            .pipe(
                this.errors.rxThrow(
                    "DjExtensionService.generateLink"
                )
            );
    }
}