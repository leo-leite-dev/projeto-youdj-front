import { Component } from '@angular/core';
import { MusicHubComponent } from "./music-hub/music-hub";
import { QueueComponent } from './queue/queue';
import { PlayerComponent } from "./player/player";

@Component({
  selector: 'app-music-control-panel',
  imports: [
    MusicHubComponent,
    QueueComponent,
    PlayerComponent
  ],
  templateUrl: './music-control-panel.html',
  styleUrl: './music-control-panel.scss',
})
export class MusicControlPanel {

}