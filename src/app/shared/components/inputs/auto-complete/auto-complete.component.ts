import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { BehaviorSubject, isObservable, Observable, Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

export interface SelectableItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

export type MusicAction = 'playlist' | 'queue' | 'play';
export type AutocompleteValue<T> = string | T | null;
export type DisplayFn<T> = (value: T | null) => string;

@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent<T extends SelectableItem>
  implements ControlValueAccessor, OnDestroy {
  private readonly optionsBS = new BehaviorSubject<T[]>([]);
  private readonly destroy$ = new Subject<void>();

  readonly inputCtrl = new FormControl<string>('', { nonNullable: true });
  readonly filtered$ = this.optionsBS.asObservable();

  value: T | null = null;
  private touched = false;

  @Input()
  set options(value: T[] | Observable<T[]> | null) {
    if (!value) {
      this.optionsBS.next([]);
      return;
    }

    if (isObservable(value)) {
      value
        .pipe(takeUntil(this.destroy$))
        .subscribe(v => this.optionsBS.next(v ?? []));
    } else {
      this.optionsBS.next(value ?? []);
    }
  }

  @Input() displayWith: DisplayFn<T> = v => v ? v.name : '';
  @Input() placeholder = '';
  @Input() disabled = false;

  @Output()
  action = new EventEmitter<{ item: T; action: MusicAction }>();

  private onChange: (val: AutocompleteValue<T>) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private readonly zone: NgZone) {
    this.inputCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.value = null;
        this.onChange(value);
      });
  }

  writeValue(value: T | null): void {
    this.value = value;
    this.inputCtrl.setValue(
      value ? this.displayWith(value) : '',
      { emitEvent: false }
    );
  }

  registerOnChange(fn: (value: AutocompleteValue<T>) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled
      ? this.inputCtrl.disable()
      : this.inputCtrl.enable();
  }

  select(event: MatAutocompleteSelectedEvent): void {
    const item = event.option.value as T;
    this.value = item;

    this.inputCtrl.setValue(
      this.displayWith(item),
      { emitEvent: false }
    );

    this.onChange(item);
    this.markTouched();
  }

  onAction(item: T, action: MusicAction, event: MouseEvent): void {
    event.stopPropagation();
    this.action.emit({ item, action });
  }

  markTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  trackById = (_: number, item: SelectableItem) => item.id;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}