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
 *
 */
import {AfterViewChecked, Directive, Input} from '@angular/core';
import {Context} from '../core/context';
import {KeyEditing, KeyObject} from '../core/constants';
import {FormGroup} from '@angular/forms';
import {MetaContextComponent} from '../core/meta-context/meta-context.component';


/**
 * Common component to setup the context and also create context snapshot for later user.
 */
@Directive({})
export abstract class MetaBaseComponent implements AfterViewChecked {

  /**
   * We are in editing (editing=true) usually when we edit, create, search. Editing=false when
   * view, list
   */
  @Input()
  editing: boolean;
  /**
   * Not happy with this structure and the way I work with FG
   */
  formGroup: FormGroup;
  /**
   * Need to capture current snapshot for edit operation as when we enter editing mode and user
   * start to change values the detection loop runs for me in unpredicted order and I
   * could not find a way how to detect consistent behavior where root component start ngDoCheck,
   * child component trigger ngDoCheck, child finishes, root finishes.
   *
   * <Node1> - PUSH
   *      <Node2> - PUSH
   *          <Node3> - PUSH
   *          <Node3> - POP
   *      <Node2> - POP
   * <Node1> - POP
   *
   * This only works when view is first time rendered, but not when making changes
   *
   */
  abstract metaContext: MetaContextComponent;

  protected object: any;

  protected constructor() {
  }

  ngOnInit(): void {
    this.updateMeta();
  }


  ngAfterViewChecked(): void {
  }


  isNestedContext(): boolean {
    return this.metaContext.context.isNested;
  }

  property(key: string, defValue: any = null, context?: Context): any {
    if (context) {
      return context.propertyForKey(key) || defValue;
    } else {
      return this.metaContext.context.propertyForKey(key) || defValue;
    }
  }

  // Replace all this setup and get properties with pure pipe
  protected updateMeta() {
    if (!this.metaContext || !this.metaContext.context) {
      return;
    }
    this.editing = this.metaContext.context.booleanPropertyForKey(KeyEditing, false);
    if (this.editing) {
      this.object = this.metaContext.context.values.get(KeyObject);
    }
    this.doUpdate();
  }

  /**
   * Placeholder to be implemented by subclass. this method is triggered when we detect any
   * changes on the MetaContext
   */
  protected doUpdate(): void {
  }


}

