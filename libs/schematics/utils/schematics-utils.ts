/**
 * @license
 * Copyright Frank Kolar and others
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
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {addPackageJsonDependency, NodeDependency} from '@schematics/angular/utility/dependencies';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import {Schema} from '../ng-add/schema';
import {getWorkspace, getWorkspacePath, WorkspaceSchema} from '@schematics/angular/utility/config';
import {WorkspaceProject} from '@angular-devkit/core/src/workspace/workspace-schema';
import {getAppModulePath} from '@schematics/angular/utility/ng-ast-utils';
import {getSourceNodes, insertImport, isImported} from '@schematics/angular/utility/ast-utils';
import {Change, InsertChange, NoopChange} from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import {buildDefaultPath} from '@schematics/angular/utility/project';
import {normalize} from '@angular-devkit/core';


/**
 *
 *
 * Set of utilities copied and modified from schematics core for use of this project
 *
 *
 */

const RegisterBody = `
    // mandatory - you need to register user's defined rules and types since there is no
    // introspection in js

    const rules: any[] = appConfig.get('metaui.rules.user-rules') || [];
    rules.push(userRules);
    appConfig.set('metaui.rules.user-rules', rules);
`;

const pkgJsonPath = '/package.json';

export function addDependenciesToPackageJson(dependencies: NodeDependency[],
                                             skipInstall: boolean): Rule {
  return (host: Tree, context: SchematicContext) => {


    dependencies.forEach(dependency => {
      addPackageJsonDependency(host, dependency);
    });
    context.logger.log('info',
      `✅️ Added ${dependencies.length} packages into dependencies section`);

    if (skipInstall) {
      context.addTask(new NodePackageInstallTask());
      context.logger.log('info', `🔍 Installing packages...`);
    }
    return host;
  };
}


export function addOssCompilerScriptsToPackageJson(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {

    let content = readPackageJson(host);
    if (!content['scripts']) {
      content['scripts'] = {};
    }

    let cmd = 'java -jar node_modules/@ngx-metaui/rules/lib/resources/tools/oss/' +
      'meta-ui-parser.jar --gen --user ./node_modules/@ngx-metaui/rules/lib/metaui/core';
    let srcPath = normalize(`./${options.path}/rules`);
    content['scripts']['compile:oss'] = `${cmd} ${srcPath}`;
    content['scripts']['watch:oss'] = `watch --wait=8 'npm run compile:oss' ${srcPath} `;

    host.overwrite('package.json', JSON.stringify(content, null, 2));
    context.logger.log('info', '✅️ Added script into package.json');
    return host;
  };
}

export function addScriptsToAngularJson(scriptsPaths: string[], options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    try {
      const workspace: WorkspaceSchema = getWorkspace(host);
      let projectName = options.project || workspace.defaultProject;

      if (!projectName) {
        throw Error(`Cant Find project by name ${projectName}`);
      }
      let project: WorkspaceProject = workspace.projects[projectName];
      const scripts: any[] = (<any>project.architect)['build']['options']['scripts'];
      scriptsPaths.forEach(path => {
        if (scripts.indexOf(path) === -1) {
          scripts.push(path);
        }
      });
      context.logger.log('info', `✅️ Added scripts into angular.json`);
      host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));

    } catch (e) {
      context.logger.log('warn',
        `✅️ Failed to add scripts into angular.json`);
    }
    return host;
  };
}


export function addStylesToAngularJson(styleEntries: string[], options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    try {
      const workspace: WorkspaceSchema = getWorkspace(host);
      let projectName = options.project || workspace.defaultProject;

      if (!projectName) {
        throw Error(`Cant Find project by name ${projectName}`);
      }
      let project: WorkspaceProject = workspace.projects[projectName];
      const styles: any[] = (<any>project.architect)['build']['options']['styles'];

      styleEntries.reverse().forEach(path => {
        if (styles.indexOf(path) === -1) {
          styles.unshift(path);
        }
      });


      context.logger.log('info', `✅️ Added styles into angular.json`);
      host.overwrite(getWorkspacePath(host), JSON.stringify(workspace, null, 2));

    } catch (e) {
      context.logger.log('warn',
        `✅️ Failed to add scripts into angular.json`);
    }
    return host;
  };
}


export function addFileHeaderImports(options: Schema, importSymbol: string,
                                     importPath: string, isDefault?: boolean): Rule {

  return (host: Tree, context: SchematicContext) => {
    try {

      let modulePath = getAppModulePath(host, getMainProjectPath(host, options));
      let srcPath = getSourceFile(host, modulePath);

      if (!isImported(srcPath, importSymbol, importPath)) {
        let changes = doAddImportStatement(srcPath, modulePath, importSymbol, importPath,
          isDefault);

        const recorder = host.beginUpdate(modulePath);
        changes.forEach((change) => {
          if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
          }
        });
        host.commitUpdate(recorder);

      } else {
        context.logger.log('info', `✅️ Import MetaUIRulesModule already exists`);
      }

    } catch (e) {
      context.logger.log('warn', `✅️ Failed to add Import module ${e}`);
    }
    return host;
  };
}


export function setupOptions(host: Tree, options: Schema): Tree {
  const workspace = getWorkspace(host);
  let projectName = options.project || workspace.defaultProject;

  if (!projectName) {
    throw Error(`Cant Find project by name ${projectName}`);
  }
  const project: WorkspaceProject = workspace.projects[projectName];
  if (project.projectType === 'library') {
    throw Error('At the moment we support only application project type !');
  }
  if (!options.path) {
    options.path = buildDefaultPath(project);
  }
  return host;
}

/**
 *
 * Please see ast-utils.addSymbolToNgModuleMetadata for more info. I need to be able
 * to insert only import
 *
 */
function doAddImportStatement(source: ts.SourceFile, ngModulePath: string, symbolName: string,
                              importPath: string | null = null, isDefault?: boolean): Change[] {

  if (importPath !== null) {

    return [
      insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''),
        importPath, isDefault)
    ];
  }
  return [];
}


export function getSourceFile(host: Tree, path: string) {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  const content = buffer.toString();
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}


export function getMainProjectPath(host: Tree, options: Schema) {
  let project: WorkspaceProject = getWorkspaceProject(host, options);

  return (<any>project.architect).build.options.main;
}


export function getWorkspaceProject(host: Tree, options: Schema) {

  const workspace: WorkspaceSchema = getWorkspace(host);
  let projectName = options.project || workspace.defaultProject;

  if (!projectName) {
    throw Error(`Cant Find project by name ${projectName}`);
  }
  return workspace.projects[projectName];
}

export function registerUserRulesWithAppConfig(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {

    let modulePath = getAppModulePath(host, getMainProjectPath(host, options));

    let changes = addConstructorInjectionForAppConfig(host, options);
    const declarationRecorder = host.beginUpdate(modulePath);
    for (let change of changes) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);

    context.logger.log('info', '✅️ App module class updated with AppConfig ' +
      'injection');
    return host;
  };
}


function addConstructorInjectionForAppConfig(host: Tree, options: Schema): Change[] {
  let modulePath = getAppModulePath(host, getMainProjectPath(host, options));
  let srcPath = getSourceFile(host, modulePath);
  let nodes = getSourceNodes(srcPath);
  let ctorNode = nodes.find(n => n.kind === ts.SyntaxKind.Constructor);

  let constructorChange: Change[];
  if (!ctorNode) {
    constructorChange = createConstructorForInjection(modulePath, nodes);

  } else {
    constructorChange = addInjectionToExistingConstructor(modulePath, ctorNode);
  }
  return constructorChange;

}

function createConstructorForInjection(modulePath: string, nodes: ts.Node[]): Change[] {

  let classNode = nodes.find(n => n.kind === ts.SyntaxKind.ClassKeyword);
  if (!classNode) {
    throw new SchematicsException(`expected class in ${modulePath}`);
  }
  if (!classNode.parent) {
    throw new SchematicsException(`expected constructor in ${modulePath}
    to have a parent node`);
  }

  let siblings = classNode.parent.getChildren();
  let classIndex = siblings.indexOf(classNode);

  siblings = siblings.slice(classIndex);
  let classIdentifierNode = siblings.find(n => n.kind === ts.SyntaxKind.Identifier);

  if (!classIdentifierNode) {
    throw new SchematicsException(`expected class in ${modulePath} to have an identifier`);
  }


  let curlyNodeIndex = siblings.findIndex(n => n.kind === ts.SyntaxKind.FirstPunctuation);

  siblings = siblings.slice(curlyNodeIndex);

  let listNode = siblings.find(n => n.kind === ts.SyntaxKind.SyntaxList);

  if (!listNode) {
    throw new SchematicsException(`expected first class in ${modulePath} to have a body`);
  }

  let toAdd = `
  constructor(private appConfig: AppConfig) {
    ${RegisterBody}
  }
`;

  return [new InsertChange(modulePath, listNode.pos + 1, toAdd)];

}


function addInjectionToExistingConstructor(modulePath: string, ctorNode: ts.Node): Change[] {

  let siblings = ctorNode.getChildren();

  let parameterListNode = siblings.find(n => n.kind === ts.SyntaxKind.SyntaxList);

  if (!parameterListNode) {
    throw new SchematicsException(`expected constructor in ${modulePath} to have a parameter list`);
  }

  let parameterNodes = parameterListNode.getChildren();

  let paramNode = parameterNodes.find(p => {
    let typeNode = findSuccessor(p, [ts.SyntaxKind.TypeReference,
      ts.SyntaxKind.Identifier]);
    if (!typeNode) {
      return false;
    }
    return typeNode.getText() === 'AppConfig';
  });

  if (!paramNode && parameterNodes.length === 0) {
    let toAdd = `private appConfig: AppConfig`;
    return [new InsertChange(modulePath, parameterListNode.pos, toAdd)];

  } else if (!paramNode && parameterNodes.length > 0) {

    let toAdd = `, private appConfig: AppConfig`;
    let lastParameter = parameterNodes[parameterNodes.length - 1];

    let ctorBlock = siblings.find(n => n.kind === ts.SyntaxKind.Block);
    if (!ctorBlock) {
      throw new SchematicsException(`unable to locale ctor block`);
    }

    let bodyStart = ctorBlock.getChildren().find(n => n.kind === ts.SyntaxKind.SyntaxList);
    if (!bodyStart) {
      throw new SchematicsException(`unable to locale ctor body`);
    }

    return [
      new InsertChange(modulePath, lastParameter.end, toAdd),
      new InsertChange(modulePath, bodyStart.pos, RegisterBody)
    ];
  }

  return [new NoopChange()];
}


function findSuccessor(node: ts.Node, searchPath: ts.SyntaxKind[]) {
  let children = node.getChildren();
  let next: ts.Node | undefined;

  for (let syntaxKind of searchPath) {
    next = children.find(n => n.kind === syntaxKind);
    if (!next) {
      return null;
    }
    children = next.getChildren();
  }
  return next;
}


function showTree(node?: ts.Node, indent: string = '    '): void {
  if (!node) {
    return;
  }

  console.log(indent + ts.SyntaxKind[node.kind]);

  if (node.getChildCount() === 0) {
    console.log(indent + '    Text: ' + node.getText());
  }

  for (let child of node.getChildren()) {
    showTree(child, indent + '    ');
  }
}


function readPackageJson(host: Tree) {
  if (host.exists('package.json')) {
    const jsonStr = host.read('package.json') !.toString('utf-8');
    const json = JSON.parse(jsonStr);

    return json;
  }

  throw new SchematicsException('Cant read package.json in order to add script');
}
