/**
 *
 * @license
 * F. Kolar
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
 *
 */
/**
 * Used by IncludeComponent directive in order to convert string to type. Ideally you dont want this
 * here where right now we need this to import this file:
 *
 *  `import * as entryComponents from './entry-components';`
 *
 *  Then iterate thru the content to register each TYPE that needs to be instantiated.
 */
export * from './ui/input/input.component';
export * from './ui/text-area/text-area.component';
export * from './ui/select/select.component';
export * from './ui/checkbox/checkbox.component';
export * from './ui/radio-group/radio-group.component';
export * from './ui/date-picker/date-picker.component';
export * from './ui/button/button.component';
export * from './ui/string/string.component';
export * from './ui/autocomplete/autocomplete.component';

export * from './metaui/meta-form/meta-form-group.component';
export * from './metaui/meta-content-page/meta-content-page.component';
export * from './metaui/meta-action-list/meta-action-list.component';
export * from './metaui/meta-element-list/meta-element-list.component';

