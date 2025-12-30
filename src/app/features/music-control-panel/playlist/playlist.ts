import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PlaylistService } from './services/playlist.service';
import { PlaylistFolder } from './models/playlist-folder';
import { SessionService } from '../../../core/auth/services/session.service';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './playlist.html',
  styleUrl: './playlist.scss',
})
export class PlaylistComponent implements OnInit {

  private readonly playlistService = inject(PlaylistService);
  private readonly session = inject(SessionService);

  folders$!: Observable<PlaylistFolder[]>;

  isCreating = false;
  folderName = '';

  ngOnInit(): void {
    this.folders$ = this.playlistService.folders$;

    this.session.dj$.subscribe(dj => {
      this.playlistService.loadFolders(dj.playlistId);
    });
  }

  startCreate(): void {
    this.isCreating = true;
    this.folderName = '';
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.folderName = '';
  }

  confirmCreate(): void {
    const name = this.folderName.trim();
    if (!name) return;

    const user = this.session.userSnapshot();
    if (!user) return;

    this.playlistService
      .createFolder({
        playlistId: user.playlistId,
        name
      })
      .subscribe(() => {
        this.isCreating = false;
        this.folderName = '';
      });
  }
}