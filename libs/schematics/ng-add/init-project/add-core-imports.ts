import {AddSchema} from '../../common/add-schema';
import {chain, Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {addModuleImportToModule, insertImport, parseSourceFile} from '@angular/cdk/schematics';
import {InsertChange} from '@schematics/angular/utility/change';


export function addRulesRequiredModulesAndImports(options: AddSchema): Rule {
  return chain([
    addFileHeaderImports(options),
    addNgModuleImports(options)
  ]);
}

function addNgModuleImports(options: AddSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const imports = [
      'BrowserAnimationsModule', '@angular/platform-browser/animations',
      'MetaUIRulesModule.forRoot({})', '@ngx-metaui/rules'
    ];

    try {
      const modulePath = options.module as string;
      const text = host.read(modulePath);
      if (text === null) {
        throw new SchematicsException(`File ${modulePath} does not exist.`);
      }
      const sourceText = text.toString('utf-8');
      const hasNxModule = sourceText.includes('MetaUIRulesModule.forRoot({})');

      if (!hasNxModule) {
        addModuleImportToModule(host, modulePath, imports[0], imports[1]);
        addModuleImportToModule(host, modulePath, imports[2], imports[3]);
      }

    } catch (e) {
      context.logger.log('warn',
        `✅️ Failed to add MetaUIRulesModule into NgModule imports ${e}`);
    }
    return host;
  };
}

function addFileHeaderImports(options: AddSchema): Rule {
  return (host: Tree, context: SchematicContext) => {

    const modulePath = options.module as string;
    const moduleSource: any = parseSourceFile(host, modulePath);

    const recorder = host.beginUpdate(modulePath);
    const changes = [
      insertImport(moduleSource, modulePath, 'MetaConfig, MetaUIRulesModule',
        '@ngx-metaui/rules'),
      insertImport(moduleSource, modulePath, '* as userRules',
        './rules/user-rules', true)
    ];

    changes.forEach((change) => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    host.commitUpdate(recorder);
    return host;
  };
}
