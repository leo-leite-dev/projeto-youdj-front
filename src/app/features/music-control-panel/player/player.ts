import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, switchMap, takeUntil, timer, tap, distinctUntilChanged } from 'rxjs';
import { PlayerService } from './services/player.service';
import { QueueService } from '../queue/services/queue.service';
import { SessionService } from '../../../core/auth/services/session.service';
import { CurrentPlayingResponse } from './contracts/current-playing-response';
import { YouTubeService } from './services/youtube.serivce';

interface YouTubePlayerWithSize extends YT.Player {
  setSize(width: number, height: number): void;
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
  styleUrls: ['./player.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {

  private readonly playerService = inject(PlayerService);
  private readonly queueService = inject(QueueService);
  private readonly session = inject(SessionService);
  private readonly youtube = inject(YouTubeService);

  private readonly destroy$ = new Subject<void>();

  private ytPlayer?: YouTubePlayerWithSize;
  private playerReady = false;
  private pendingVideoId?: string;
  private djId!: string;

  readonly current$ = new BehaviorSubject<CurrentPlayingResponse | null>(null);

  ngOnInit(): void {
    this.initYouTubePlayer();
    this.initPlayerEffect();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizePlayer);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initYouTubePlayer(): void {
    if (this.ytPlayer)
      return;

    this.youtube.loadApi()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ytPlayer = new window.YT.Player('yt-player', {
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1
          },
          events: {
            onReady: () => {
              this.playerReady = true;

              this.resizePlayer();
              window.addEventListener('resize', this.resizePlayer);

              if (this.pendingVideoId) {
                this.ytPlayer!.loadVideoById(this.pendingVideoId);
                this.pendingVideoId = undefined;
              }
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                this.onVideoEnded();
              }
            }
          }
        }) as YouTubePlayerWithSize;
      });
  }

  private resizePlayer = (): void => {
    if (!this.ytPlayer) 
      return;

    const container = document.querySelector('.player-screen') as HTMLElement;
    if (!container) 
      return;

    const width = container.clientWidth;
    const height = Math.round(width * 9 / 16);

    this.ytPlayer.setSize(width, height);
  };

  private initPlayerEffect(): void {
    this.session.djId$
      .pipe(
        distinctUntilChanged(),
        tap(djId => this.djId = djId),
        switchMap(djId => this.startPolling(djId)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private startPolling(djId: string) {
    return timer(0, 3000).pipe(
      switchMap(() => this.playerService.getCurrent(djId)),
      tap(current => this.handleCurrent(current))
    );
  }

  private handleCurrent(current: CurrentPlayingResponse | null): void {
    if (!current) {
      this.current$.next(null);
      return;
    }

    if (this.current$.value?.externalId === current.externalId)
      return;

    this.current$.next(current);

    if (this.playerReady && this.ytPlayer)
      this.ytPlayer.loadVideoById(current.externalId);

    else
      this.pendingVideoId = current.externalId;
  }

  private onVideoEnded(): void {
    this.playerService.finishPlaying()
      .pipe(
        tap(() => {
          this.current$.next(null);
          this.queueService.loadQueue();
        }),
        switchMap(() => this.playerService.playFirstFromQueue(this.djId)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}