import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, switchMap, takeUntil, timer, tap, distinctUntilChanged } from 'rxjs';
import { PlayerService } from './services/player.service';
import { QueueService } from '../queue/services/queue.service';
import { SessionService } from '../../../core/auth/services/session.service';
import { CurrentPlayingResponse } from './contracts/current-playing-response';
import { YouTubeService } from './services/youtube.serivce';

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

  private ytPlayer?: YT.Player;
  private djId!: string;
  private playerReady = false;
  private pendingVideoId?: string;

  readonly current$ = new BehaviorSubject<CurrentPlayingResponse | null>(null);

  ngOnInit(): void {
    this.initYouTubePlayer();
    this.initPlayerEffect();
  }

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

  private initYouTubePlayer(): void {

    if (this.ytPlayer)
      return;

    this.youtube.loadApi()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {

        this.ytPlayer = new window.YT.Player('yt-player', {
          playerVars: {
            autoplay: 1,
            controls: 1
          },
          events: {
            onReady: () => {
              this.playerReady = true;

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
        });
      });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}