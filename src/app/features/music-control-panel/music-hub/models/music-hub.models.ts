export interface YoutubeVideo {
    videoId: string;
    title: string;
    thumbnailUrl: string;
}

export interface YoutubeSearchResult {
    items: YoutubeVideo[];
}