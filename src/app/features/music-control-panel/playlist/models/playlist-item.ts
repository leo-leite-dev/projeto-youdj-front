export interface PlaylistItem {
    id: string;
    playlistId: string;
    folderId?: string;
    externalId: string;
    title: string;
    thumbnailUrl: string;
    source: string;
    position: number;
}