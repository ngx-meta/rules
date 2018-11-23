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
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {APP_BASE_HREF} from '@angular/common';
import {By} from '@angular/platform-browser';
import {Entity, META_RULES, MetaRules, MetaUIRulesModule} from '@ngx-metaui/rules';
import {PrimeNgRulesModule} from '../../primeng-rules.module';


// @formatter:off
/* tslint:disable */
export const UserStackRule = {
  oss: [
    {
      '_selectors': [{'_key': 'layout', '_value': 'InspectTest2', '_isDecl': false}],
      '_properties': {'trait': 'Stack'}, '_rank': 0
    }, {
      '_selectors': [
        {'_key': 'layout', '_value': 'InspectTest2', '_isDecl': false},
        {'_key': 'layout', '_value': 'First', '_isDecl': true}
      ], '_properties': {'elementStyle': 'padding-bottom:100px', 'trait': 'Form'}, '_rank': 0
    }, {
      '_selectors': [{'_key': 'layout', '_value': 'InspectTest2', '_isDecl': false}],
      '_rank': 0
    },
    {
      '_selectors': [
        {'_key': 'layout', '_value': 'InspectTest2', '_isDecl': false},
        {'_key': 'layout', '_value': 'Second', '_isDecl': true}
      ], '_properties': {'trait': 'Form', 'zonePath': 'Second'}, '_rank': 0
    }, {
      '_selectors': [{'_key': 'layout', '_value': 'InspectTest2', '_isDecl': false}],
      '_rank': 0
    },
    {'_selectors': [{'_key': 'class', '_value': 'UserStack', '_isDecl': false}], '_rank': 0}, {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': '*', '_isDecl': false}
      ], '_properties': {'after': 'zNone'}, '_rank': 0
    }, {'_selectors': [{'_key': 'class', '_value': 'UserStack', '_isDecl': false}], '_rank': 0},
    {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': 'firstName', '_isDecl': false}
      ], '_properties': {'after': 'zLeft'}, '_rank': 0
    }, {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': 'lastName', '_isDecl': false}
      ], '_properties': {'after': 'firstName'}, '_rank': 0
    }, {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': 'age', '_isDecl': false}
      ], '_properties': {'after': 'lastName'}, '_rank': 0
    }, {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': 'department', '_isDecl': false}
      ], '_properties': {'after': 'age'}, '_rank': 0
    }, {'_selectors': [{'_key': 'class', '_value': 'UserStack', '_isDecl': false}], '_rank': 0},
    {
      '_selectors': [
        {'_key': 'class', '_value': 'UserStack', '_isDecl': false},
        {'_key': 'field', '_value': 'email', '_isDecl': false}
      ], '_properties': {'after': 'Second.zLeft'}, '_rank': 0
    }, {'_selectors': [{'_key': 'class', '_value': 'UserStack', '_isDecl': false}], '_rank': 0}
  ]
};
// @formatter:on
/* tslint:disable */

describe('How  Stack layout can render two different content stacked', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestContainerEditComponent
      ],
      imports: [
        MetaUIRulesModule.forRoot({'env.test': true}),
        PrimeNgRulesModule.forRoot()
      ],
      providers: [{provide: APP_BASE_HREF, useValue: '/'}]
    });

    TestBed.compileComponents();
  });


  it('should render two FormTables', () => {

    const metaUI: MetaRules = TestBed.get(META_RULES);
    metaUI.addTestUserRule('UserStackRule', UserStackRule);

    let fixtureWrapper = TestBed.createComponent(TestContainerEditComponent);
    fixtureWrapper.detectChanges();

    let formTables = fixtureWrapper.debugElement.queryAllNodes(By.css('.w-form-table'));

    fixtureWrapper.detectChanges();
    expect(formTables).toBeDefined();
    expect(formTables.length).toEqual(2);
  });


});


class UserStack implements Entity {
  constructor(public firstName: string, public lastName: string,
              public age: number, public department: string,
              public email: string) {
  }


  identity(): string {
    return this.lastName;
  }

  className(): string {
    return 'UserStack';
  }

  getTypes(): any {
    return {
      firstName: String,
      lastName: String,
      age: Number,
      department: String,
      eamil: String
    };
  }
}


@Component({
  selector: 'wrapper-comp',
  template: '<m-context [object]="user" operation="edit" layout="InspectTest2"><m-include-component >' +
    '</m-include-component></m-context>'
})
class TestContainerEditComponent {
  user: UserStack = new UserStack('Frank', 'Kolar', 1000, 'aa.', 'fkolar@gmail.com');
}

