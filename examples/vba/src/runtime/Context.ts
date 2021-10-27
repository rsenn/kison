import parser from '../parser';
import type { AstRootNode } from '../parser';
import type {
  VBValue,
  SubBinder,
  VBFile,
  SubSymbolItem,
  VBClass,
} from './types';
import { evaluate } from './evaluator/index';
import { load } from './loader/index';
import {
  SymbolItem,
  VBScope,
  ArgInfo,
  VB_EMPTY,
  VBObject,
  ExitResult,
  VBEmpty,
  END_EXIT_RESULT,
  FileSymbolTable,
} from './types';
import { last } from './utils';

const defaultFileId: VBFile = {
  id: Math.random() + '',
  name: 'default',
  type: 'module',
};

export class Context {
  astMap = new Map<VBFile, AstRootNode>();

  subBindersMap = new Map<string, SubBinder>();

  currentFile: VBFile = defaultFileId;

  symbolTable = new Map<string, FileSymbolTable>();

  scopeStack: VBScope[] = [];

  load(code: string, file: VBFile = defaultFileId) {
    if (!code) {
      this.symbolTable.delete(file.id);
    }
    const { ast, error } = parser.parse(code);
    if (error) {
      throw new Error(error.errorMessage);
    }
    this.astMap.set(file, ast);
    this.currentFile = file;
    this.symbolTable.set(file.id, new FileSymbolTable(file));
    return load(ast, this);
  }

  registerSymbolItem(name: string, item: SymbolItem) {
    const { symbolTable, currentFile: currentFileId } = this;
    const currentTable = symbolTable.get(currentFileId.id)!;
    currentTable.symbolTable.set(name.toLowerCase(), item);
  }

  registerSubBinder(subBinder: SubBinder) {
    this.subBindersMap.set(subBinder.name.toLowerCase(), subBinder);
  }

  getCurrentScope() {
    return last(this.scopeStack)!;
  }

  renameFile(id: string, name: string) {
    const { symbolTable } = this;
    for (const fileSymbolTable of symbolTable.values()) {
      const { file } = fileSymbolTable;
      if (file.id === id) {
        file.name = name;
      }
    }
  }

  getSymbolItem(name: string, myFile?: VBFile) {
    const { symbolTable } = this;
    if (myFile) {
      const item = this.getSymbolItemFromFile(name, myFile.id, true);
      if (item) {
        return item;
      }
    }
    for (const file of symbolTable.keys()) {
      const item = this.getSymbolItemFromFile(name, file);
      if (item) {
        return item;
      }
    }
  }

  getSymbolItemFromFile(
    name: string,
    file: string,
    noCheckPublic: boolean = false,
  ) {
    const item = this.symbolTable.get(file);
    if (item && item.type === 'module') {
      const sub = item.symbolTable.get(name);
      if (sub) {
        if (noCheckPublic || sub.visibility === 'PUBLIC') {
          return sub;
        }
      }
    }
  }

  getFileIdFromFileName(name: string) {
    for (const fileSymbolTable of this.symbolTable.values()) {
      const { file } = fileSymbolTable;
      if (file.name === name) {
        return file.id;
      }
    }
    throw new Error('Can not find file name: ' + name);
  }

  async callSubSymbolItem(
    subSymbolItem: SubSymbolItem,
    args: (VBValue | VBObject)[] = [],
    classObj?: VBClass,
  ) {
    const argumentsInfo = subSymbolItem.arugmentsInfo;
    const subName = subSymbolItem.name.toLowerCase();
    this._setupScope(subName, args, argumentsInfo, subSymbolItem.file);
    if (classObj) {
      last(this.scopeStack).classObj = classObj;
    }
    let ret = await evaluate(subSymbolItem.block, this);
    if (ret && (ret as ExitResult).type === 'Exit') {
      const exit: ExitResult = ret;
      if (exit.token.token === 'END') {
        return exit;
      }
    }
    if (subSymbolItem.type === 'function') {
      ret = last(this.scopeStack).getVariable(subName).value;
    } else {
      ret = VBEmpty;
    }
    this.scopeStack.pop();
    return ret;
  }

  _setupScope(
    subName: string,
    args: (VBValue | VBObject)[],
    argumentsInfo: ArgInfo[],
    file: VBFile = this.currentFile,
  ) {
    const scope = new VBScope(file, subName, this);
    let i = -1;
    for (const a of args) {
      ++i;
      const argInfo = argumentsInfo[i];
      if (!argInfo) {
        continue;
      }
      if (a.type === 'Object' && argInfo.byRef) {
        scope.setVariable(argInfo.name, new VBObject(a, argInfo.asType));
      } else {
        scope.setVariableValue(argInfo.name, a);
      }
    }
    while (i < argumentsInfo.length) {
      const argInfo = argumentsInfo[i];
      if (argInfo) {
        if (argInfo.optional && argInfo.defaultValue) {
          scope.setVariableValue(
            argInfo.name,
            new VBObject(argInfo.defaultValue.value, argInfo.asType),
          );
        }
      }
      ++i;
    }
    this.scopeStack.push(scope);
  }

  async callSub(subName: string, args: (VBValue | VBObject)[] = []) {
    subName = subName.toLowerCase();

    function getItemFromFile(file: string, noCheck: boolean = false) {
      const item = symbolTable.get(file);
      if (item && item.type === 'module') {
        const sub = item.symbolTable.get(subName);
        if (sub && sub.type !== 'variable') {
          if (noCheck || sub.visibility === 'PUBLIC') {
            return sub;
          }
        }
      }
    }

    const { subBindersMap, symbolTable } = this;
    let subSymbolItem: SubSymbolItem | undefined = getItemFromFile(
      this.currentFile.id,
      true,
    );
    if (!subSymbolItem) {
      for (const file of symbolTable.keys()) {
        subSymbolItem = getItemFromFile(file);
        if (subSymbolItem) {
          break;
        }
      }
    }
    if (subSymbolItem) {
      return this.callSubSymbolItem(subSymbolItem, args);
    }
    const def = subBindersMap.get(subName);
    if (!def) {
      throw new Error('Can not find sub definition: ' + subName);
    }
    this._setupScope(subName, args, def.argumentsInfo);
    let ret = def.fn(this);
    if (ret && (ret as Promise<any>).then) {
      ret = await ret;
    }
    if (ret === false) {
      return END_EXIT_RESULT;
    }
    this.scopeStack.pop();
    return ret || VB_EMPTY;
  }
}
