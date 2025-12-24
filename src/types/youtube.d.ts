export { };

declare global {
    namespace YT {

        enum PlayerState {
            UNSTARTED = -1,
            ENDED = 0,
            PLAYING = 1,
            PAUSED = 2,
            BUFFERING = 3,
            CUED = 5
        }

        interface PlayerVars {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            rel?: 0 | 1;
            modestbranding?: 0 | 1;
        }

        interface OnStateChangeEvent {
            data: PlayerState;
            target: Player;
        }

        interface PlayerEvents {
            onReady?: (event: { target: Player }) => void;
            onStateChange?: (event: OnStateChangeEvent) => void;
        }

        class Player {
            constructor(
                elementId: string | HTMLElement,
                options: {
                    videoId?: string;
                    playerVars?: PlayerVars;
                    events?: PlayerEvents;
                }
            );

            loadVideoById(videoId: string): void;
            playVideo(): void;
            pauseVideo(): void;
            stopVideo(): void;
            destroy(): void;
        }
    }
}