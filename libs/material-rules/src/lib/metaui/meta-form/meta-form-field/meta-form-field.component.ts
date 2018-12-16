/**
 * @license
 * Copyright F. Kolar
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Based on original work: MetaUI: Craig Federighi (2008)
 *
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Host,
  Input,
  ViewChild
} from '@angular/core';
import {AbstractControl, FormControl, NgModel, ValidatorFn, Validators} from '@angular/forms';
import {Environment, KeyBindings, MetaBaseComponent, MetaContextComponent} from '@ngx-metaui/rules';
import {MatFormField} from '@angular/material';


/**
 *
 * Used by form group in order to render individual form fields that are instantiated
 * programmatically using MetaInclude directive. What is instantiated is defined inside OSS file.
 *
 * Here is little workaround to be able to dynamically instantiate INPUT component and place
 * it inside the material's form field. The <mat-form-field> requires only a child component
 * child that is type of MatFormFieldControl which our directive MetaInclude is not. So
 * there is created simple directive that adds Required type MatFormFieldControl to the existing
 * Directive + delegates all the calls to actual instantiated component.
 *
 *
 */
@Component({
  selector: 'm-form-field',
  templateUrl: 'meta-form-field.component.html',
  styleUrls: ['meta-form-field.component.scss']

})
export class MetaFormField extends MetaBaseComponent implements AfterViewInit {

  @Input()
  field: string;


  /**
   * Reference to parent component the MatFormField that we used to get hold of the control so
   * some validation rules can be registered
   */
  @ViewChild('formField')
  mdFormField: MatFormField;


  /**
   * Cached validators
   */
  validators: ValidatorFn[];

  errorMessage: string;


  constructor(@Host() protected _metaContext: MetaContextComponent,
              private elem: ElementRef,
              private cd: ChangeDetectorRef,
              public env: Environment) {
    super(env, _metaContext);
  }


  ngOnInit(): void {
    super.ngOnInit();
    this.validators = this.createValidators();

  }


  ngDoCheck(): void {
    super.ngDoCheck();

    if (this.control && !this.control.validator) {
      this.registerValidators(this.control);
    }
  }

  ngAfterViewInit(): void {
    const ngControl: NgModel = <NgModel>this.mdFormField._control.ngControl;
    if (ngControl) {
      this.registerValidators(ngControl.control);
    }
  }


  bindingBoolProperty(key: string): boolean {
    const bindings: Map<string, any> = this.context.propertyForKey(KeyBindings);

    if (bindings && bindings.has(key)) {
      const value = bindings.get(key);
      return !!value;
    }
    return false;
  }


  bindingStringProperty(key: string): string {
    const bindings: Map<string, any> = this.context.propertyForKey(KeyBindings);

    if (bindings && bindings.has(key)) {
      return bindings.get(key);

    }
    return null;
  }


  /**
   * Creates angular based Validator which for a current field executes validation rules real
   * time as you type. At the bottom of the file there is example of async validator
   *
   */
  private createValidators(): ValidatorFn[] {
    const that = this;
    const metaValidator = (control: AbstractControl): { [key: string]: any } => {
      // Validators.required(control) ||
      if (!control.touched) {
        return null;
      }

      const errorMsg = that.context.meta.validationError(that.context);
      return errorMsg ? {'metavalid': {'msg': errorMsg}} : null;
    };

    return [metaValidator];
  }

  isRequired(): boolean {
    return this.editing && this.context.booleanPropertyForKey('required', false);
  }

  private registerValidators(control: FormControl) {
    let validators: ValidatorFn[] = [];

    if (this.validators && this.validators.length > 0) {
      validators = [...validators, ...this.validators];
    }

    if (validators.length === 1) {
      control.setValidators(validators[0]);
    } else if (validators.length > 1) {
      control.setValidators(Validators.compose(validators));
    }
  }

  hasErrors(): boolean {
    if (this.editing && this.mdFormField && this.mdFormField._control.ngControl.control.invalid) {
      this.errorMessage = this.control.errors['metavalid'] ? this.control.errors['metavalid'].msg
        : '';
      return true;
    }
    return false;
  }

  get control(): FormControl {
    if (this.mdFormField && this.mdFormField._control.ngControl) {
      return <FormControl> this.mdFormField._control.ngControl.control;
    }
    return null;
  }
}
