import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {InvoiceComponent} from './domain/invoice/invoice.component';
import {InvoiceViewComponent} from './domain/invoice/invoice-view.component';


const demoRouting: Routes = [
  {
    path: 'demo', component: HomeComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'invoice/create',
        component: InvoiceComponent
      },
      {
        path: 'invoice/edit/:id',
        component: InvoiceComponent
      },
      {
        path: 'invoice/view/:id',
        component: InvoiceViewComponent
      }
    ]

  }

];


@NgModule({
  imports: [
    RouterModule.forChild(demoRouting)
  ],
  exports: [
    RouterModule
  ]
})
export class DemoRoutingModule {
}