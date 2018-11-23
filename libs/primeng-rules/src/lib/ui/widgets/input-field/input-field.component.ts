import {distinctUntilChanged} from 'rxjs/operators';
import {Component, forwardRef, Inject, Input, Optional, SkipSelf} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {isPresent} from '../../core/utils/lang';
import {FormRowComponent} from '../../layouts/form-table/form-row/form-row.component';
import {Subscription} from 'rxjs';
import {DecimalPipe} from '@angular/common';
import {BaseFormComponent, Environment, Value} from '@ngx-metaui/rules';


/**
 * This component represent a Input field and it can  accept different types of values such as
 * text, number.
 *
 *
 *
 * ### Example
 *
 * ```typescript
 *  @Component({
 *      selector: 'wrapper-comp' ,
 *      template: '<aw-input-field [value]="inputValue" [type]="inputType"></aw-input-field>'
 *  })
 *  export class TestInputComponent
 *  {
 *      inputValue: string = 'Some text';
 *
 *      // by default input type is text, you can pass string, String, or text
 *      inputType: string = 'string';
 *  }
 *
 * ```
 *
 *
 *
 * ### Example wher input field is initialized with ngModel
 *
 * ```typescript
 *  @Component({
 *      selector: 'wrapper-comp' ,
 *      template: '<aw-input-field [value]="inputValue" [(ngModel)]="inputType"></aw-input-field>'
 *  })
 *  export class TestInputComponent
 *  {
 *      inputValue: string = 'Some text';
 *
 *      // by default input type is text, you can pass string, String, or text
 *      inputType: string = 'string';
 *  }
 *
 * ```
 *
 *  Note: if you are using this outside of FormTable please provide your own FormGroup
 *
 */



export const INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputFieldComponent),
  multi: true
};


@Component({
  selector: 'aw-input-field',
  templateUrl: 'input-field.component.html',
  styleUrls: ['input-field.component.scss'],

  providers: [
    INPUT_CONTROL_VALUE_ACCESSOR,

    {provide: BaseFormComponent, useExisting: forwardRef(() => InputFieldComponent)}
  ]
})
export class InputFieldComponent extends BaseFormComponent {

  /**
   *
   * A value used to save and read  when rendering and updating a component
   *
   */
  @Input()
  value: any = '';

  /**
   *
   * The number of decimal places used to format the number object.
   *
   */
  @Input()
  precision: number;

  /**
   * BigDecimal object that encapsulates value and locale.
   * If this object is set, values will be taken from this object
   */
  @Input()
  bigDecimal: BigDecimal;

  /**
   * Provide custom icon that is placed into the input field.
   *
   * Todo: add extra binding that will allow developer to tell position, left right
   */
  @Input()
  icon: string;
  /**
   * The decimal pipe is used to format our number object.
   */
  decimalPipe: DecimalPipe;
  /**
   * The formatted decimal value. Uses angular decimalPipe to format based on locale.
   */
  displayValue: string = '';
  /**
   * Just to clean up subscriber when component is destroyed
   */
  private vchSubscriber: Subscription;

  constructor(public env: Environment,
              @SkipSelf() @Optional() @Inject(forwardRef(() => FormRowComponent))
              protected parentContainer: BaseFormComponent) {
    super(env, parentContainer);
    this.decimalPipe = new DecimalPipe(env.locale);
  }

  /**
   * Input field type. Currently we support either Number or text
   */
  private _type: string = 'string';

  get type(): string {
    return this._type;
  }

  /**
   *
   * generated setter to check for value and normalizing into expected either number or text
   *
   */
  @Input()
  set type(value: string) {
    if (value.toLowerCase() === 'string' || value.toLowerCase() === 'text') {
      this._type = 'text';
    } else if (value.toLowerCase() === 'number') {
      this._type = 'number';
    }
  }

  ngOnInit() {
    super.ngOnInit();
    super.registerFormControl(this.bigDecimal);

    this.vchSubscriber = this.formControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(val => {
        this.value = val;
        this.onModelChanged(this.value);
      });

    if (this.bigDecimal) {
      this.displayValue = this.formatNumber(this.bigDecimal.amount);
    } else {
      this.displayValue = this.value;
    }
  }

  canSetType(): boolean {
    return true;
  }

  onKeyDown(el: any): void {
    if (this._type === 'number') {
      this.displayValue = el.value;
      this.onModelChanged(this.displayValue);
    }
  }

  onBlur(el: any): void {
    if (this._type === 'number') {
      this.bigDecimal = new BigDecimal(Number(el.value));
      this.displayValue = this.formatNumber(this.bigDecimal.amount);
      this.onModelChanged(this.displayValue);
    }
  }

  writeValue(value: any) {
    if (value !== this.displayValue) {
      this.value = value;
      this.displayValue = '';
      if (this.value) {
        this.displayValue = this.value;
      }
      this.formControl.setValue(value, {onlySelf: true});
    }
  }

  /**
   * Format the number object according to its precision.
   *
   */
  formatNumber(value: any) {
    if (!value) {
      return '';
    }

    // If precision is present, use it for format the bigDecimal value for display.
    if (isPresent(this.precision) &&
      this._type === 'number') {
      // The default precision is 2. For example, 10.23.
      let digits = '1.0-2';
      digits = '1.0-' + this.precision;
      return this.decimalPipe.transform(value, digits);
    }
    return value;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (isPresent(this.vchSubscriber)) {
      this.vchSubscriber.unsubscribe();
    }
  }
}

/**
 * BigDecimal object is represented as a value, locale, and currencyCode
 */
export class BigDecimal implements Value {
  uniqueName: string;

  constructor(public readonly amount: number = 0,
              public readonly locale: string = 'en_US') {
  }


  getTypes(): any {
    return {
      amount: Number,
      locale: String
    };
  }

  className(): string {
    return 'BigDecimal';
  }

  toString(): string {
    return this.amount + ', locale: ' + this.locale;
  }


  clone(data: { amount?: number, locale?: string } = {}): BigDecimal {
    return new BigDecimal(
      isPresent(data.amount) ? data.amount : this.amount,
      isPresent(data.locale) ? data.locale : this.locale);
  }

}

