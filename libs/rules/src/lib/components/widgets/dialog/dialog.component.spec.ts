/**
 *
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
 *
 */
import {Component, ViewChild} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {DialogComponent} from './dialog.component';
import {AribaCoreModule} from '../../../core/ariba.core.module';
import {ModalService} from '../../core/modal-service/modal.service';
import {AWDialogModule} from '../../widgets/dialog/dialog.module';
import {AWButtonModule} from '../../widgets/button/button.module';
import {Environment} from '../../../core/config/environment';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {AribaComponentsTestProviderModule} from '../../ariba.component.provider.module';


describe('Component: dialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestDialogDefaultComponent,
        TestBasicDialogPopupBehaviorComponent,
        TestCustomDialogBehaviorComponent,
        MyDialogComponent
      ],
      imports: [
        AribaCoreModule.forRoot({'i18n.enabled': false, 'env.test': true}),
        AribaComponentsTestProviderModule.forRoot(),
        AWDialogModule,
        NoopAnimationsModule,
        AWButtonModule
      ]
    });

    TestBed.compileComponents();
  });

  it('should instantiate dialog component and values for title and body', () => {

    const fixtureWrapper = TestBed.createComponent(TestDialogDefaultComponent);
    fixtureWrapper.detectChanges();

    expect(fixtureWrapper.componentInstance.dialog.title).toEqual('title text');
    expect(fixtureWrapper.componentInstance.dialog.body).toEqual('body text');
  });

  it('should display popup default dialog component', fakeAsync(() => {

    const fixtureWrapper = TestBed.createComponent(TestBasicDialogPopupBehaviorComponent);
    fixtureWrapper.detectChanges();

    // Find the open button
    const button = fixtureWrapper.nativeElement.querySelector('button');
    button.click();

    tick();
    fixtureWrapper.detectChanges();

    expect(fixtureWrapper.componentInstance.dialog.title).toEqual('My Popup Title');
    expect(fixtureWrapper.componentInstance.dialog.body)
      .toEqual('My Popup Body');
  }));

  it('should close dialog when default dialog component closed button is clicked.',
    fakeAsync(() => {

      const fixtureWrapper = TestBed.createComponent(TestBasicDialogPopupBehaviorComponent);
      fixtureWrapper.detectChanges();

      const button = fixtureWrapper.nativeElement.querySelector('button');
      button.dispatchEvent(new Event('click'));

      tick();
      fixtureWrapper.detectChanges();

      // Verify that the dialog is open.
      expect(fixtureWrapper.componentInstance.dialog.title).toEqual('My Popup Title');
      expect(fixtureWrapper.componentInstance.dialog.body).toEqual('My Popup Body');


      // Find the close button, click it to close the popup.
      let closeBtn = fixtureWrapper.nativeElement
        .getElementsByClassName('ui-dialog-titlebar-close');
      closeBtn[0].dispatchEvent(new Event('click'));

      tick();
      fixtureWrapper.detectChanges();

      // Verify that the dialog is closed by searching for the dialog
      closeBtn = fixtureWrapper.nativeElement.getElementsByClassName('close');
      expect(closeBtn.length).toEqual(0);

    }));

  xit('should display popup custom dialog component multiple times',
    fakeAsync(() => {


      // https://github.com/angular/angular/issues/10760
      // Work around because
      // TestBed.configureTestingModule
      // doesn't have
      // entryComponents. That is
      // needed to dynamically
      // create components.
      TestBed.overrideModule(AWDialogModule, {
        set: {
          entryComponents: [MyDialogComponent]
        }
      });

      const fixtureWrapper = TestBed.createComponent(TestCustomDialogBehaviorComponent);
      fixtureWrapper.detectChanges();

      openDialog(fixtureWrapper);

      const templates = fixtureWrapper.nativeElement.querySelectorAll('.icon-action');
      expect(templates.length).toEqual(2);

      closeDialog(fixtureWrapper);

    }));

  xit('should close popup custom dialog component', fakeAsync(() => {


    // https://github.com/angular/angular/issues/10760
    // Work around because
    // TestBed.configureTestingModule
    // doesn't have entryComponents.
    // That is needed to dynamically
    // create components.
    TestBed.overrideModule(
      AWDialogModule, {
        set: {
          entryComponents: [MyDialogComponent]
        }
      });

    TestBed.compileComponents();
    const fixtureWrapper = TestBed.createComponent(TestCustomDialogBehaviorComponent);
    fixtureWrapper.detectChanges();

    openDialog(fixtureWrapper);


    let closeBtn = closeDialog(fixtureWrapper);

    // Verify that the dialog is
    // closed by searching for the
    // dialog
    closeBtn = fixtureWrapper.nativeElement.getElementsByClassName('ui-dialog-titlebar-close');
    expect(closeBtn.length).toEqual(0);
  }));
});


function openDialog(fixture: any) {
  // Find the open button
  const button = fixture.nativeElement.querySelector('button');
  button.dispatchEvent(new Event('click'));

  tick();
  fixture.detectChanges();

  tick();
  fixture.detectChanges();

}


function closeDialog(fixture: any) {
  // Find the close button, click
  // it to close the popup.
  const closeBtn = fixture.nativeElement
    .getElementsByClassName('ui-dialog-titlebar-close');
  closeBtn[0].dispatchEvent(new Event('click'));

  tick();
  fixture.detectChanges();

  tick();
  fixture.detectChanges();
  return closeBtn;
}

/* jshint ignore:start */
@Component({
  selector: 'wrapper-comp',
  template: `
    <aw-dialog [title]="'title text'" [body]="'body text'"></aw-dialog>
  `
})
  /* jshint ignore:end */
  /**
   * Class that will only draw a dialog. This is not the way to popup a dialog, but only show that
   * the dialog is drawn correctly.
   */
class TestDialogDefaultComponent {
  @ViewChild(DialogComponent)
  dialog: DialogComponent;

  constructor() {
  }
}


/* jshint ignore:start */
@Component({
  selector: 'wrapper-comp',
  template: `
    <aw-modal></aw-modal>
    <aw-button name="'open-button'" (action)="openDialog()"></aw-button>
  `
})
  /* jshint ignore:end */
class TestBasicDialogPopupBehaviorComponent {
  dialog: DialogComponent;

  constructor(private modalService: ModalService) {
  }

  openDialog() {
    this.dialog = this.modalService.open<DialogComponent>(DialogComponent, {
      title: 'My Popup Title',
      body: 'My Popup Body'
    }).instance;
  }
}

/* jshint ignore:start */
@Component({
  selector: 'wrapper-comp',
  template: `
    <aw-modal></aw-modal>
    <aw-button name="'open-button'" (action)="openDialog()"></aw-button>
  `
})
  /* jshint ignore:end */
class TestCustomDialogBehaviorComponent {
  dialog: MyDialogComponent;

  constructor(private modalService: ModalService) {
  }

  openDialog() {
    this.dialog = this.modalService.open<MyDialogComponent>(MyDialogComponent, {}).instance;
  }
}

@Component({
  selector: 'aw-mydialog',
  template: `
    <aw-dialog (onClose)="closePopup()" [visible]="visible" [closable]="true">
      <aw-dialog-header>
        <i class="sap-icon icon-action"></i> This is my Custom Title
      </aw-dialog-header>
      <i class="sap-icon icon-action"></i> This is my Custom Body
    </aw-dialog>
  `
})
class MyDialogComponent extends DialogComponent {
  constructor(private modalService: ModalService, public env: Environment) {
    super(env);
  }

  closePopup() {
    this.modalService.close();
  }
}

