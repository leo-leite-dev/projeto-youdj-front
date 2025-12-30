export interface AddPlaylistItemRequest {
    playlistId: string;
    folderId?: string;
    externalId: string;
    title: string;
    thumbnailUrl: string;
    source: string;
}