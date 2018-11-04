/**
 * @license
 * Copyright 2017 SAP Ariba
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
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  SimpleChange,
  SkipSelf
} from '@angular/core';
import {assert, equals, isBlank, isPresent, StringWrapper} from '../../../core/utils/lang';
import {Environment} from '../../../core/config/environment';
import {ListWrapper} from '../../../core/utils/collection';
import {UIMeta} from '../../core/uimeta';
import {Context} from '../../core/context';
import {FormControl} from '@angular/forms';
import {BaseFormComponent} from '../../../components/core/base-form.component';
import {UIContext} from '../context';


/**
 *
 * MetaContext (m-context) enables manipulation of a MetaUI Context as part of the Angular's
 * component processing.
 *
 * The MetaContext tag will find the current Context in the Environment'env or will
 * create one, will push() a one level on the Context, set() all of its bindings as key/values,
 * render its content,  Since its content may contain component that further use
 * MetaContext, additional nested context manipulations may occur.
 *
 * ### Simple example
 *
 * ```typescript
 *
 *      <m-context [object]='checkRequest' operation='edit' layout='Inspect'>
 *          <m-include-component></m-include-component>
 *       </m-context>
 *
 * ```
 *
 *
 * Generally, MetaContext treats its bindings as a verbatim list of keys/values to be set()
 * on the context (i.e. the bindings above on 'object', 'layout', 'operation', and 'field'
 * are not predefined by MetaContext).
 *
 * Although we treat some bindings in special way as we expect them to be passed in as expression
 * therefore they need be defined as @Input(). The rest we tread is pure keys/values strings
 *
 * First time when component is created we use ngOnInit() to push values and ngAfterViewInit() to
 * pop values. The push/pop looks something like this:
 *
 * <Node1> - PUSH
 *      <Node2> - PUSH
 *          <Node3> - PUSH
 *          <Node3> - POP
 *      <Node2> - POP
 * <Node1> - POP
 *
 *
 * After component is fully initialized and rendered  then we use ngDoCheck() to push() and
 * ngAfterViewChecked() to pop() values.
 *
 */


/**
 * Constant represent current active and mainly latest Context
 *
 */
export const ACTIVE_CNTX = 'CurrentMC';
const CNTX_CHANGED = 'Cntx_Changed';


// define set of properties which will be skipped as they are defined as inputs or  added by
// angular
const IMPLICIT_PROPERTIES = [
  'module', 'layout', 'operation', 'class', 'object', 'actionCategory', 'action', 'field',
  'pushNewContext'
];


const IMMUTABLE_PROPERTIES = [
  'module', 'layout', 'operation', 'class', 'action', 'field', 'pushNewContext'
];


@Component({
  selector: 'm-context',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [
    {provide: BaseFormComponent, useExisting: forwardRef(() => MetaContextComponent)}
  ]
})
export class MetaContextComponent extends BaseFormComponent implements OnDestroy,
  AfterViewInit, AfterViewChecked {
  /**
   * Currently there are set of properties which can be passed as expression and therefore they
   * need to be resolved by angular. Angular does not have such option to provide flexible
   * number of Inputs. All needs to be pre-defined. If you want to pass in an
   * expression it must be defined as input. Otherwise any other attributes will be treated as
   * strings.
   */
  @Input() module: string;
  @Input() layout: string;
  @Input() operation: string;
  @Input() class: string;
  @Input() object: any;
  @Input() actionCategory: any;
  @Input() action: any;
  @Input() field: string;

  @Input() pushNewContext: boolean;


  @Output()
  beforeContextSet: EventEmitter<any> = new EventEmitter();

  @Output()
  onContextChanged: EventEmitter<any> = new EventEmitter();

  @Output()
  afterContextSet: EventEmitter<any> = new EventEmitter();


  @Output()
  onAction: EventEmitter<MetaUIActionEvent> = new EventEmitter();


  /**
   * Flag that tells us that component is fully rendered
   *
   */
  private viewInitialized: boolean = false;

  /**
   *
   * Marks MetaContext or the root MetaContext that created a new Context
   *
   */
  private contextCreated: boolean = false;

  private bindingsMap: Map<string, any>;
  private bindingKeys: string[] = [];

  /**
   * Shell copy of an object used for comparision. We may get back to the original solution which
   * I had here. THe Angular's differs
   */
  private prevObject: any;

  private _scopeBinding: string;

  // private static stackDepth = 0;


  _myContext: Context;

  /**
   * Need to cache if we already have object or not in case we load data from REST where it
   * could be deferred and not available when component is initialized
   */
  hasObject: boolean;

  constructor(private elementRef: ElementRef, public env: Environment,
              @SkipSelf() @Optional() @Inject(forwardRef(() => BaseFormComponent))
              protected parentContainer: BaseFormComponent) {
    super(env, null);
  }

  ngOnInit(): void {
    this.initBindings();
    this.hasObject = this._hasObject();

    // MetaContextComponent.stackDepth++;
    // console.log(this.indent() + '=> ngOnInit:', this.contextKey());
    // Initial push, when component is first initialized the rest is done based on changes.
    this.pushPop(true);

    if (!this.env.hasValue('parent-cnx')) {
      this.env.setValue('parent-cnx', this);
    }
  }


  /**
   * For any other immutable object detect changes here and refresh the context stack
   *
   */
  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    // console.log(this.indent() + '    => ngOnChanges', this.contextKey());


    for (const name of IMMUTABLE_PROPERTIES) {
      if (isPresent(changes[name])
        && (changes[name].currentValue !== changes[name].previousValue)) {
        this.initBindings();
        break;
      }
    }
    // in case object is coming late e.g. from some reactive API like REST then we
    // do not get it into ngInit but it will be here.
    if (this.viewInitialized && isPresent(changes['object']) && isPresent(this.object)) {
      this.initBindings();
    }
  }

  /**
   * Ng check is trigged after view is fully inialized and we want to push everything new
   * properties to the context and evaluate everything.
   *
   *
   */
  ngDoCheck(): void {

    if (this.viewInitialized) {
      this.hasObject = this._hasObject();

      // MetaContextComponent.stackDepth++;

      this.pushPop(true);
      // console.log(this.indent() + '=> ngDoCheck(CHANGED)', this.contextKey());

      if (isPresent(this.object) && !equals(this.prevObject, this.object)) {
        this.updateModel();
      }
    }
  }


  /**
   * We want to start detecting changes only after view is fully checked
   */
  ngAfterViewInit(): void {
    if (!this.viewInitialized) {
      // console.log(this.indent() + '=> ngAfterViewInit:', this.contextKey());
      // MetaContextComponent.stackDepth--;
      this.pushPop(false);
    }
  }


  ngAfterViewChecked(): void {
    if (this.viewInitialized) {
      // console.log(this.indent() + '=> ngAfterViewChecked:', this.contextKey());
      // MetaContextComponent.stackDepth--;
      this.pushPop(false);
    } else {
      this.viewInitialized = true;
    }
  }

  // private indent(): string
  // {
  //     let ind = '';
  //     for (let i = 0; i < MetaContextComponent.stackDepth; i++) {
  //         ind += '\t\t\t ';
  //     }
  //
  //     return ind;
  // }

  /**
   *
   * This is our key method that triggers all the interaction inside MetaUI world. Here we
   * push context keys and their values to the stack and this is the thing that triggers
   * rule recalculation which give us updated  properties. Those are then used by
   * MetaIncludeComponent to render the UI.
   *
   * myContext is current context for this MetaContext Component.
   *
   *    isPush identifies if we are pushing or popping to context stack
   */
  private pushPop(isPush: boolean): void {
    // console.log(this.indent() + '=> pushPop: isPush' + isPush, this.contextKey());
    let activeContext: Context = this.activeContext();
    assert(isPush || isPresent(activeContext), 'pop(): Missing context');

    const forceCreate = isPush && (isPresent(this.pushNewContext) && this.pushNewContext);
    if (isBlank(activeContext) || forceCreate) {
      const metaUI = UIMeta.getInstance();
      activeContext = metaUI.newContext(forceCreate);

      this.contextCreated = true;
      this.env.push<Context>(ACTIVE_CNTX, activeContext);
    }

    if (isPush) {
      activeContext.push();

      if (isPresent(this._scopeBinding) && this.hasObject) {

        this.beforeContextSet.emit(this._scopeBinding);
        activeContext.setScopeKey(this._scopeBinding);
        this.afterContextSet.emit(this._scopeBinding);

      } else {
        for (let index = 0; index < this.bindingKeys.length; index++) {

          const key = this.bindingKeys[index];
          const value = this.bindingsMap.get(key);

          this.beforeContextSet.emit(value);
          activeContext.set(key, value);
          this.afterContextSet.emit(value);
        }
      }
      // Save created content to local MetaContext
      this._myContext = activeContext.snapshot().hydrate(false);
    } else {
      activeContext.pop();

      if (this.contextCreated) {
        this.env.pop<Context>(ACTIVE_CNTX);
      }
    }
  }

  /**
   * Just for troubleshooting to print current context and assignments
   *
   */
  debugString(): String {
    if (isPresent(this._myContext)) {
      return this._myContext.debugString();
    }
  }

  /**
   * For debugging to identify current key
   */
  // contextKey(): string
  // {
  //     let cnxKey = '';
  //     if (isPresent(this.bindingKeys) && this.bindingKeys.length > 0) {
  //         this.bindingKeys.forEach((name) =>
  //         {
  //             if (name === 'object') {
  //                 cnxKey += name;
  //             } else {
  //                 cnxKey += name + this.bindingsMap.get(name);
  //             }
  //
  //
  //         });
  //     } else if (isPresent(this._scopeBinding)) {
  //         cnxKey += this._scopeBinding;
  //     }
  //     return cnxKey;
  // }


  /**
   *
   * Every meta context component which pushing certain properties to stack has its own context
   * that lives until component is destroyed
   *
   */
  myContext(): Context {
    return this._myContext;
    // let cnxKey = this.contextKey();
    // return this.env.getValue(cnxKey);
  }

  /**
   * We keep the most current and latest context to environment to be read by any Child
   * MetaContext for purpose of creation new context and it needs info what was already pushed
   * onto the stack.
   *
   */
  activeContext(): Context {
    return this.env.peak<Context>(ACTIVE_CNTX);
  }


  /**
   * Let's clean up and destroy pushed context
   */
  ngOnDestroy() {

    if (this.env.hasValue('parent-cnx')) {
      this.env.deleteValue('parent-cnx');
    }
  }


  /**
   * Ideally we do not need this method if Angular would support to pass variable number of
   * bindings without a need to have backup property for each of the bindings or expression./
   *
   * Once they support. we can remove this. Since this check what are known bindings passed,
   * meaning the ones decorated with @Input and the rest
   *
   */
  private initBindings() {
    this.bindingsMap = new Map<string, any>();
    const nativeElement = this.elementRef.nativeElement;

    this.initImplicitBindings();
    for (let i = 0; i < nativeElement.attributes.length; i++) {
      const attr: Attr = nativeElement.attributes.item(i);
      if (this.ignoreBinding(attr)) {
        continue;
      }
      if (isPresent(attr.name) && attr.name.toLowerCase() === 'scopekey') {
        this._scopeBinding = attr.value;

      } else {
        this.bindingsMap.set(attr.name, attr.value);
      }
    }
    this.bindingKeys = [];
    this.bindingsMap.forEach((value, key) => {
      this.bindingKeys.push(key);
    });

    // Sort them by their importance or rank
    ListWrapper.sortByExample(this.bindingKeys, IMPLICIT_PROPERTIES);
  }


  /**
   * The thing we want is to pass variable number of bindings and resolve them programmatically.
   * Currently in Angular we cannot do this we have these set of properties where we expect
   * some expression, some dynamic properties. For the rest we expect only string literal to be
   * passed in therefore we can resolve them with nativeElement.attributes
   *
   */
  private initImplicitBindings() {
    if (isPresent(this.module)) {
      this.bindingsMap.set('module', this.module);
    }
    if (isPresent(this.layout)) {
      this.bindingsMap.set('layout', this.layout);
    }
    if (isPresent(this.operation)) {
      this.bindingsMap.set('operation', this.operation);
    }
    if (isPresent(this.class)) {
      this.bindingsMap.set('class', this.class);
    }
    if (isPresent(this.object)) {
      this.bindingsMap.set('object', this.object);
      this.prevObject = Object.assign({}, this.object);
    }
    if (isPresent(this.actionCategory)) {
      this.bindingsMap.set('actionCategory', this.actionCategory);
    }
    if (isPresent(this.action)) {
      this.bindingsMap.set('action', this.action);
    }
    if (isPresent(this.field)) {
      this.bindingsMap.set('field', this.field);
    }
  }

  /**
   *
   * Since we are going thru the element' attributes we want to skip anything that has nothign
   * to do with us.
   *
   */
  private ignoreBinding(attr: Attr) {
    return IMPLICIT_PROPERTIES.indexOf(attr.name) !== -1 ||
      StringWrapper.contains(attr.name, '_ng') ||
      StringWrapper.contains(attr.name, 'ng-') ||
      StringWrapper.contains(attr.name, '(') ||
      (isBlank(attr.value) || attr.value.length === 0);
  }


  /**
   * If object is changed we need to also update our angular model to reflect user changes. All
   * changes and updates in metaui use object references
   */
  private updateModel() {
    const fields = Object.keys(this.object);
    fields.forEach((field: string) => {
      const control: FormControl = <FormControl> this.formGroup.get(field);
      if (isPresent(control)) {
        control.patchValue(this.object[field], {onlySelf: false, emitEvent: true});
      }
    });

    this.prevObject = Object.assign({}, this.object);
  }


  private _hasObject(): boolean {
    const context = this.activeContext();
    if (isPresent(context)) {
      return isPresent((<UIContext> context).object);
    }
    return false;
  }
}


/**
 *
 * Defines format for the broadcasted action event. MetaUI can also execute actions which needs to
 * be handled by application or actual component using this m-context.
 *
 */
export class MetaUIActionEvent {

  constructor(/**
               * What component trigered action
               */
              public component: any,
              /**
               * Name of the action. Usually name of the @Output of actual component
               */
              public eventName: string,
              /**
               * Actions or event that are broadcasted can be wrapped with @action or @layout
               * which has its name. We want to also send out this name to the application to
               * know what metaui action or layout triggered this
               */
              public cnxName: string,
              /**
               * Any data that you can pass
               */
              public data: any) {

  }
}


