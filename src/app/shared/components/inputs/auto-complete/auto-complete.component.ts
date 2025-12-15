import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  NgZone,
  OnDestroy
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {
  BehaviorSubject,
  isObservable,
  Observable,
  Subject,
  takeUntil
} from 'rxjs';

export interface SelectableItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

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
    MatInputModule
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

  /* ================================
   * INPUT OPTIONS (CRÍTICO)
   * ================================ */
  @Input()
  set options(value: T[] | Observable<T[]> | null) {
    console.log('[AC][INPUT] options recebido:', value);

    if (!value) {
      console.warn('[AC][INPUT] options é null/undefined');
      return;
    }

    if (isObservable(value)) {
      console.log('[AC][INPUT] options é Observable');

      value
        .pipe(takeUntil(this.destroy$))
        .subscribe(v => {
          console.log('[AC][INPUT] Observable emitiu:', v);
          this.optionsBS.next(v ?? []);
        });

    } else {
      console.log('[AC][INPUT] options é array direto:', value);
      this.optionsBS.next(value ?? []);
    }
  }

  @Input() displayWith: DisplayFn<T> = v => v ? v.name : '';
  @Input() placeholder = '';
  @Input() disabled = false;

  readonly inputCtrl = new FormControl<string>('', { nonNullable: true });
  readonly filtered$ = this.optionsBS.asObservable();

  value: T | null = null;
  private touched = false;

  private onChange: (val: AutocompleteValue<T>) => void = () => {};
  private onTouched: () => void = () => {};

  /* ================================
   * CONSTRUCTOR / STREAMS
   * ================================ */
  constructor(private readonly zone: NgZone) {

    this.optionsBS
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        console.log('[AC][STATE] optionsBS atual:', v);
      });

    this.inputCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('[AC][INPUT] inputCtrl mudou:', value);
        this.value = null;
        this.onChange(value);
      });
  }

  /* ================================
   * CVA METHODS
   * ================================ */
  writeValue(value: T | null): void {
    console.log('[AC][CVA] writeValue chamado com:', value);

    this.value = value;
    this.inputCtrl.setValue(
      value ? this.displayWith(value) : '',
      { emitEvent: false }
    );
  }

  registerOnChange(fn: (value: AutocompleteValue<T>) => void): void {
    console.log('[AC][CVA] registerOnChange');
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    console.log('[AC][CVA] registerOnTouched');
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    console.log('[AC][CVA] setDisabledState:', isDisabled);

    this.disabled = isDisabled;
    isDisabled
      ? this.inputCtrl.disable()
      : this.inputCtrl.enable();
  }

  /* ================================
   * AUTOCOMPLETE EVENTS
   * ================================ */
  select(event: MatAutocompleteSelectedEvent): void {
    console.log('[AC][EVENT] optionSelected:', event);
    console.log('[AC][EVENT] option.value:', event.option.value);

    const item = event.option.value as T;
    this.value = item;

    this.inputCtrl.setValue(
      this.displayWith(item),
      { emitEvent: false }
    );

    this.onChange(item);
    this.markTouched();
  }

  markTouched(): void {
    if (!this.touched) {
      console.log('[AC][STATE] marcado como touched');
      this.onTouched();
      this.touched = true;
    }
  }

  /* ================================
   * TRACKBY
   * ================================ */
  trackById = (_: number, item: SelectableItem) => {
    console.log('[AC][TRACKBY] item:', item);
    return item.id;
  };

  /* ================================
   * DESTROY
   * ================================ */
  ngOnDestroy(): void {
    console.log('[AC][LIFECYCLE] destroy');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
