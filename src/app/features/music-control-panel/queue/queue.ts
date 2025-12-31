import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, take } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { QueueService } from './services/queue.service';
import { QueueItem } from './models/queue-item.mode';
import { DjExtensionService } from '../../../shared/services/dj-extension.service';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './queue.html',
  styleUrl: './queue.scss',
})
export class QueueComponent implements OnInit {

  private readonly queueService = inject(QueueService);
  private readonly djExtensionService = inject(DjExtensionService);

  queue$!: Observable<QueueItem[]>;

  toastVisible = false;
  toastMessage = '';

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

  openDjExtensionModal(): void {
    this.djExtensionService.generateLink()
      .pipe(take(1))
      .subscribe({
        next: (res) => this.copyAndNotify(res.url)
      });
  }

  private copyAndNotify(link: string): void {
    navigator.clipboard.writeText(link);

    this.showToast('Link copiado 🎉');
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 2200);
  }

  trackById(_: number, item: QueueItem): string {
    return item.id;
  }
}