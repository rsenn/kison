import type {
  Ast_FunctionStmt_Node,
  Ast_SubStmt_Node,
  Ast_PropertyLetStmt_Node,
  Ast_PropertySetStmt_Node,
  Ast_PropertyGetStmt_Node,
} from '../../parser';
import { collect_asTypeClause } from '../collect/collectType';
import { Context } from '../Context';
import { throwVBError } from '../errorCodes';
import { evaluate } from '../evaluator/index';
import {
  ArgInfo,
  VBMissingArgument,
  VBPointer,
  VBBasicTypeClasses,
  VBSub,
  VBValue,
  VBAny,
} from '../types';
import { getPropertyGetSubName, getPropertySetSubName } from '../utils';
import { registerLoaders, load } from './loaders';

async function loadCall(
  node:
    | Ast_FunctionStmt_Node
    | Ast_SubStmt_Node
    | Ast_PropertyGetStmt_Node
    | Ast_PropertyLetStmt_Node
    | Ast_PropertySetStmt_Node,
  context: Context,
) {
  for (const c of node.children) {
    if (c.type === 'symbol' && c.symbol === 'ambiguousIdentifier') {
      const vbSub = new VBSub(node, context);
      await vbSub.init();
      let name = c.children[0].text;
      if (node.symbol === 'propertyGetStmt') {
        name = getPropertyGetSubName(name);
      } else if (
        node.symbol === 'propertySetStmt' ||
        node.symbol === 'propertyLetStmt'
      ) {
        name = getPropertySetSubName(name);
      }
      context.registerSymbolItemInternal(name, vbSub);
      return;
    }
  }
  throwVBError('NOT_FOUND_SUB', node.symbol);
}

registerLoaders({
  loadSubStmt(node, context) {
    return loadCall(node, context);
  },

  loadFunctionStmt(node, context) {
    return loadCall(node, context);
  },

  loadPropertyGetStmt(node, context) {
    return loadCall(node, context);
  },

  loadPropertySetStmt(node, context) {
    return loadCall(node, context);
  },

  loadPropertyLetStmt(node, context) {
    return loadCall(node, context);
  },

  async loadArgList(node, context) {
    const ret: ArgInfo[] = [];
    for (const c of node.children) {
      if (c.type === 'symbol' && c.symbol === 'arg') {
        const argInfo = await load(c, context);
        ret.push(argInfo);
      }
    }
    for (let i = 0; i < ret.length; i++) {
      if (ret[i].paramArray && i !== ret.length - 1) {
        throwVBError('PARAMARRAY_LAST_ARGUMENT');
      }
    }
    return ret;
  },

  async loadArg(node, context) {
    const argInfo: ArgInfo = {
      byRef: true,
      name: '',
      asType: {
        type: 'Variant',
        isArray: false,
      },
    };
    let lp = false;
    for (const c of node.children) {
      if (c.type === 'token') {
        const { token } = c;
        if (token === 'BYVAL') {
          argInfo.byRef = false;
        } else if (token === 'OPTIONAL') {
          argInfo.optional = true;
        } else if (token === 'PARAMARRAY') {
          argInfo.paramArray = true;
        } else if (token === 'LPAREN') {
          lp = true;
        }
      } else if (c.type === 'symbol') {
        const { symbol } = c;
        if (symbol === 'ambiguousIdentifier') {
          argInfo.name = c.children[0].text;
        } else if (symbol === 'asTypeClause') {
          argInfo.asType = collect_asTypeClause(c, context);
        } else if (symbol === 'argDefaultValue') {
          const defaultValue: VBAny = await evaluate(c.children[1], context);
          if (defaultValue.type === 'Pointer') {
            argInfo.defaultValue = await defaultValue.getValue();
          } else {
            argInfo.defaultValue = defaultValue;
          }
        }
      }
    }
    if (!lp && argInfo.paramArray) {
      throwVBError('PARAMARRAY_TYPE');
    }
    const type = argInfo.asType?.type || 'Variant';
    if (argInfo.paramArray) {
      if (argInfo.byRef === false) {
        throwVBError('PARAMARRAY_BY_REF');
      }
      if (type !== 'Variant') {
        throwVBError('PARAMARRAY_VARIANT');
      }
    }

    if (argInfo.optional && !argInfo.defaultValue) {
      const VBBasicTypeClass = (VBBasicTypeClasses as any)[type];
      if (!VBBasicTypeClass) {
        throwVBError('DEFAULT_VALUE_TYPE');
      }
      if (type === 'Variant') {
        argInfo.defaultValue = new VBMissingArgument();
      } else {
        argInfo.defaultValue = new VBBasicTypeClass();
      }
    }
    return argInfo;
  },
});
