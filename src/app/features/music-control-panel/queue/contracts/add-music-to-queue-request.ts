export interface AddMusicToQueueRequest {
    ExternalId: string,
    Title: string,
    ThumbnailUrl: string,
    DurationSeconds?: number,
    Source: string
}