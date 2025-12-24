import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { MusicHubService } from './services/music-hub.service';
import { QueueService } from '../queue/services/queue.service';
import { AutocompleteComponent, MusicAction, SelectableItem } from '../../../shared/components/inputs/auto-complete/auto-complete.component';
import { FaIconComponent } from '../../../shared/components/icons/fa-icon.component';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { PlayerService } from '../player/services/player.service';

@Component({
  selector: 'app-music-hub',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutocompleteComponent,
    FaIconComponent
  ],
  templateUrl: './music-hub.html',
  styleUrls: ['./music-hub.scss'],
})
export class MusicHubComponent implements OnDestroy {

  private readonly musicHubService = inject(MusicHubService);
  private readonly queueService = inject(QueueService);
  private readonly playerService = inject(PlayerService);

  private readonly destroy$ = new Subject<void>();

  readonly songCtrl = new FormControl<string | SelectableItem | null>(null);
  options: SelectableItem[] = [];

  musicIcon = faMusic;

  constructor() {

    this.songCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((value): value is string => {
          if (typeof value !== 'string') return false;

          if (value.length < 2) {
            this.options = [];
            return false;
          }

          return true;
        }),
        switchMap(term => this.musicHubService.searchMusic(term)),
        takeUntil(this.destroy$),
      )
      .subscribe(videos => {
        this.options = videos.map(video => ({
          id: video.videoId,
          name: video.title,
          thumbnailUrl: video.thumbnailUrl,
        }));
      });
  }

  onMusicAction(event: { item: SelectableItem; action: MusicAction }): void {
    const { item, action } = event;

    switch (action) {

      case 'queue':
        this.queueService.addMusic({
          ExternalId: item.id,
          Title: item.name,
          ThumbnailUrl: item.thumbnailUrl!,
          Source: 'YouTube'
        }).subscribe();
        break;

      case 'play':
        this.playerService.playNow({
          externalId: item.id,
          title: item.name,
          thumbnailUrl: item.thumbnailUrl!,
          source: 'YouTube'
        }).subscribe();
        break;

      case 'playlist':
        console.log('Adicionar à playlist:', item);
        break;
    }

    this.resetSearch();
  }

  displayWith = (item: SelectableItem | null): string =>
    item?.name ?? '';

  private resetSearch(): void {
    this.songCtrl.setValue(null, { emitEvent: false });
    this.options = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}