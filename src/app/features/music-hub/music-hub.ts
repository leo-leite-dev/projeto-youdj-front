import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { MusicHubService } from './music-hub.service';
import { AutocompleteComponent, SelectableItem } from '../../shared/components/inputs/auto-complete/auto-complete.component';
import { FaIconComponent } from '../../shared/components/icons/fa-icon.component';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

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

  readonly songCtrl = new FormControl<string | SelectableItem | null>(null);
  options: SelectableItem[] = [];
    musicIcon = faMusic;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly service: MusicHubService) {

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
        switchMap(term => this.service.searchMusic(term)),
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

  displayWith = (item: SelectableItem | null): string =>
    item?.name ?? '';

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}