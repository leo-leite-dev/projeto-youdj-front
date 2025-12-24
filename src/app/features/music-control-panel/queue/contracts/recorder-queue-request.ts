export interface ReorderQueueRequest {
    items: ReorderQueueItem[];
}

export interface ReorderQueueItem {
    queueItemId: string;
    position: number;
}