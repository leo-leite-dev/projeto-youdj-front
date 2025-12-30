export interface LoginResponse {
    djId: string;
    playlistId: string;
    accessToken: string;
    expiresAtUtc: string;
    isDj: boolean;
}