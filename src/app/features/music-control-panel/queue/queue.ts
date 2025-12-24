import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { QueueService } from './services/queue.service';
import { QueueItem } from './models/queue-item.mode';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './queue.html',
  styleUrl: './queue.scss',
})
export class QueueComponent implements OnInit {

  queue$!: Observable<QueueItem[]>;

  constructor(private readonly queueService: QueueService) { }

  ngOnInit(): void {
    this.queue$ = this.queueService.queue$;
    this.queueService.loadQueue();
  }

  drop(event: CdkDragDrop<QueueItem[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.queueService.reorderQueue(
      event.previousIndex,
      event.currentIndex
    );
  }

  trackById(_: number, item: QueueItem): string {
    return item.id;
  }
}