import {APP_INITIALIZER, Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {META_RULES, MetaRules} from '@ngx-metaui/rules';

import {SystemRules} from './metaui/widgets-rules';
import {SystemPersistenceRules} from './metaui/persistence-rules';
import * as entryComponents from './entry-components';
import {ErrorManagerService} from './ui/core/error-manager.service';
import {DomUtilsService} from './ui/core/dom-utils.service';
import {DataTypeProviderRegistry} from './ui/core/data/datatype-registry.service';
import {DataProviders} from './ui/core/data/data-providers';
import {DataFinders} from './ui/core/data/data-finders';
import {MetaUILibLayoutModule} from './metaui/meta-ui-layout.module';

@NgModule({
  imports: [
    CommonModule,
    MetaUILibLayoutModule
  ],
  exports: []
})
export class PrimeNgRulesModule {


  constructor() {

  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PrimeNgRulesModule,
      providers: [
        ErrorManagerService,
        DomUtilsService,
        DataTypeProviderRegistry,
        DataProviders,
        DataFinders,
        {
          'provide': APP_INITIALIZER,
          'useFactory': initLibMetaUI,
          'deps': [Injector],
          'multi': true
        }
      ]
    };
  }

}


/**
 *
 * Entry factory method that initialize The METAUI layer and here we load WidgetsRules.oss as well
 * as Persistence Rules.
 *
 */
export function initLibMetaUI(injector: Injector) {
  const initFce = function init(inj: Injector) {

    const promise: Promise<any> = new Promise((resolve: any) => {
      const metaRules: MetaRules = injector.get(META_RULES);
      metaRules.loadUILibSystemRuleFiles(entryComponents, SystemRules, SystemPersistenceRules);

      resolve(true);
    });
    return promise;
  };
  return initFce.bind(initFce, injector);
}
