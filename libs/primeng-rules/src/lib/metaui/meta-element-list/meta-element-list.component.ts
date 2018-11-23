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
import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Context, Environment, MetaContextComponent, MetaLayout} from '@ngx-metaui/rules';
import {isPresent} from '../../ui/core/utils/lang';

/**
 * MetaElementList is implementation of Stack Layout where the content is rendered as list (stacked)
 * You do not use this layout directly as it is instantiated dynamically using MetaIncludeDirective.
 *
 * For more detail please checkout WidgetRules.oss the part bellow where create new trait
 * that can be applied to any layout.
 *
 * ```
 *
 * layout {
 *
 *   @trait=Stack { visible:true; component:MetaElementListComponent }
 *
 * }
 *
 * ```
 *
 * Actual usage could be :
 *
 *
 * ```
 *  layout=Inspect2#Stack {
 *       @layout=First#Form {
 *           elementStyle:"padding-bottom:100px";
 *       }
 *       @layout=Second#Form { zonePath:Second; }
 *   }
 *
 *
 *
 *    class=User {
 *       zNone => *;
 *       zLeft => firstName => lastName => age => department;
 *       Second.zLeft => email;
 *
 *   }
 *
 * ```
 *
 */
@Component({
  templateUrl: 'meta-element-list.component.html',
  styleUrls: ['meta-element-list.component.scss']
})
export class MetaElementListComponent extends MetaLayout {


  constructor(protected _metaContext: MetaContextComponent, public env: Environment,
              public sanitizer: DomSanitizer) {
    super(_metaContext, env);

  }


  styleString(name: string): any {
    const lContext: Context = this.contextMap.get(name);
    // return isPresent(lContext) && isPresent(lContext.propertyForKey('elementStyle')) ?
    //     this.sanitizer.bypassSecurityTrustStyle(lContext.propertyForKey('elementStyle')) :
    // null;

    return null;
  }


  classString(name: string): any {
    const lContext: Context = this.contextMap.get(name);
    return isPresent(lContext) ? lContext.propertyForKey('elementClass') : null;
  }
}
