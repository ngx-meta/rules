import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialRulesModule} from '@ngx-metaui/material-rules';
import {MetaConfig, MetaUIRulesModule} from '@ngx-metaui/rules';
import * as userRules from './user-rules';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {AppRoutingModule} from './app-routing.module';
import {HomeComponent} from './home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {UserDetailExposedComponent} from './user-detail-exposed/user-detail-exposed.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [
    AppComponent,
    UserDetailComponent,
    UserDetailExposedComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,

    MetaUIRulesModule.forRoot(),
    MaterialRulesModule.forRoot()

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {


  constructor(private config: MetaConfig) {
    // mandatory - you need to register user's defined rules and types since there is no
    // introspection in js
    config.registerRules(userRules);
  }
}
