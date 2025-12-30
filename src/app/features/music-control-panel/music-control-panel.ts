import { Component } from '@angular/core';
import { MusicHubComponent } from "./music-hub/music-hub";
import { QueueComponent } from './queue/queue';
import { PlayerComponent } from "./player/player";
import { PlaylistComponent } from "./playlist/playlist";

@Component({
  selector: 'app-music-control-panel',
  imports: [
    MusicHubComponent,
    QueueComponent,
    PlayerComponent,
    PlaylistComponent
  ],
  templateUrl: './music-control-panel.html',
  styleUrl: './music-control-panel.scss',
})
export class MusicControlPanel {

}