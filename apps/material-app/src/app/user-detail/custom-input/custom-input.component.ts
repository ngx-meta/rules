import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  Optional,
  Renderer2,
  Self,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatFormFieldControl} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Platform} from '@angular/cdk/platform';
import {AutofillMonitor} from '@angular/cdk/text-field';
import {Subject} from 'rxjs';
import {Directionality} from '@angular/cdk/bidi';


@Component({
  selector: 'custom-input-field',
  templateUrl: './custom-input.component.html',
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomInputComponent implements MatFormFieldControl<any>, ControlValueAccessor, DoCheck {

  @Input()
  id: string;

  @Input()
  type: string = 'text';

  @Input()
  placeholder: string;

  @Input()
  readonly: boolean = false;

  @Input()
  required: boolean = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;

    this._cd.markForCheck();
    this.stateChanges.next();
  }

  private _errorState: boolean;


  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (newValue !== this._value) {
      this._value = newValue;
      this.onChange(newValue);
      this._cd.markForCheck();
      this.stateChanges.next();
    }
  }

  /**
   * Reference to internal INPUT element having MatInput directive so we can set this reference
   * back to the MatInput
   */
  @ViewChild('inputField', {static: true})
  protected inputControl: ElementRef;


  private _disabled = false;
  private _value: string;
  /** @internal */
  private _composing = false;
  private _compositionMode = false;


  isRtl: boolean;


  readonly stateChanges = new Subject<void>();
  focused = false;
  autofilled = false;

  onChange = (_: any) => {
  };

  onTouched = () => {
  };


  constructor(
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    protected _platform: Platform,
    private _cd: ChangeDetectorRef,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() protected parentForm: NgForm,
    @Optional() protected parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() @Inject(MAT_INPUT_VALUE_ACCESSOR) private inputValueAccessor: any,
    private autofillMonitor: AutofillMonitor,
    private _renderer: Renderer2,
    private dir: Directionality,
    ngZone: NgZone) {


    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }


  /** @internal */
  get nativeElement(): any {
    return this.inputControl.nativeElement;
  }

  get empty(): boolean {
    return !this._elementRef.nativeElement.value && !this.value;
  }


  get errorState(): boolean {
    return this._errorState;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get controlType(): string {
    return 'mat-input';
  }

  onContainerClick(event: MouseEvent): void {
  }

  setDescribedByIds(ids: string[]): void {
  }


  ngOnInit(): void {
    this.isRtl = this.dir.value === 'rtl';
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }


  registerOnChange(fn: (_: any) => void): void {
    if (this.type === 'number') {
      this.onChange = (value) => {
        fn(value === '' ? null : parseFloat(value));
      };
    } else {
      this.onChange = fn;
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this.nativeElement, 'disabled', isDisabled);
  }

  writeValue(value: any): void {
    this.value = value;
    this.onChange(value);
    this.stateChanges.next();
  }

  onInput(value: any): void {
    if (!this._compositionMode || (this._compositionMode && !this._composing)) {
      this.onChange(this.value);
      this.stateChanges.next();
    }
  }

  _focusChanged(isFocused: boolean): void {
    // Since we have custom ValueAccessor
    this.focused = isFocused;
    this.onTouched();
    this.stateChanges.next();

  }

  /** @internal */
  _compositionStart(): void {
    this._composing = true;
  }

  /** @internal */
  _compositionEnd(value: any): void {
    this._composing = false;
    this.onChange(value);
  }

  private updateErrorState() {
    const oldState = this.errorState;
    const parent = this.parentForm;
    const control = this.ngControl ? this.ngControl.control as FormControl : null;
    const newState = !!(control && control.invalid && (control.touched ||
      (parent && parent.submitted)));

    if (newState !== oldState) {
      this._errorState = newState;
      this.stateChanges.next();
    }
  }


}

