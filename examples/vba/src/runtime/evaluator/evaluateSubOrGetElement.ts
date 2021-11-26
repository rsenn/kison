import type {
  Ast_ICS_B_ProcedureCall_Node,
  Ast_ECS_ProcedureCall_Node,
  Ast_ECS_MemberProcedureCall_Node,
  Ast_ICS_B_MemberProcedureCall_Node,
} from '../../parser';
import { collectAmbiguousIdentifier } from '../collect/collectType';
import type { Context } from '../Context';
import { VBAny, VB_MISSING_ARGUMENT } from '../types';
import { evaluate, registerEvaluators } from './evaluators';
import {
  buildArgs,
  buildIndexes,
  callSubOrGetElementWithIndexesAndArgs,
} from './common';
import { throwVBRuntimeError } from '../errorCodes';
import {
  IndexedArg,
  NamedArg,
  VBArguments,
} from '../data-structure/VBArguments';

async function callSub(
  node: Ast_ICS_B_ProcedureCall_Node | Ast_ECS_ProcedureCall_Node,
  context: Context,
  tokenIndex: number,
) {
  const { children } = node;
  const token = children[tokenIndex];
  if (token.type !== 'symbol' || token.symbol !== 'ambiguousIdentifier') {
    throwVBRuntimeError('SYNTAX_ERROR');
  }
  const subName = token.children[0].text;
  let args: VBArguments | undefined = await buildArgs(node, context);
  return await context.callSubInternal(subName, args);
}

async function callMemberSub(
  node: Ast_ICS_B_MemberProcedureCall_Node | Ast_ECS_MemberProcedureCall_Node,
  context: Context,
) {
  const { children } = node;

  let subName = '';

  let parent: VBAny | undefined;

  for (const c of children) {
    if (c.type === 'symbol' && c.symbol === 'implicitCallStmt_InStmt') {
      parent = await evaluate(c, context);
    } else if (c.type === 'symbol' && c.symbol === 'ambiguousIdentifier') {
      subName = c.children[0].text;
    }
  }

  if (!parent) {
    throwVBRuntimeError('UNEXPECTED_ERROR', 'member access');
  }

  const argsCall = await buildArgs(node, context);

  const indexes = await buildIndexes(node, context);

  return callSubOrGetElementWithIndexesAndArgs(
    parent,
    subName,
    indexes,
    context,
    argsCall,
  );
}

registerEvaluators({
  evaluateSubStmt() {
    return;
  },

  'evaluate.'() {},

  evaluateFunctionStmt() {
    return;
  },

  async evaluateICS_B_MemberProcedureCall(node, context) {
    return callMemberSub(node, context);
  },

  async evaluateECS_MemberProcedureCall(node, context) {
    return callMemberSub(node, context);
  },

  async evaluateICS_B_ProcedureCall(node, context) {
    return callSub(node, context, 0);
  },

  async evaluateECS_ProcedureCall(node, context) {
    return callSub(node, context, 1);
  },

  async evaluateArgsCall(node, context) {
    const args = new VBArguments();
    const { children } = node;
    const missingArg: IndexedArg | NamedArg = {
      type: 'indexed',
      value: VB_MISSING_ARGUMENT,
    };
    let lastArg: IndexedArg | NamedArg = missingArg;
    for (const c of children) {
      if (c.type === 'token' && c.text === ',') {
        args.addArg(lastArg);
        lastArg = missingArg;
        continue;
      }
      context.stashMemberInternal();
      lastArg = await evaluate(c, context);
      context.popMemberInternal();
    }
    if (children.length) {
      args.addArg(lastArg);
    }
    return args;
  },

  async evaluateArgCall(node, context) {
    const valueStmt = node.children[0];
    const values = valueStmt.children;
    const v2 = values[1];
    if (v2 && v2.type === 'token' && v2.token === 'ASSIGN') {
      const value = await evaluate(values[2]!, context);
      const nameNode = values[0];
      if (
        nameNode.type !== 'symbol' ||
        nameNode.symbol !== 'ambiguousIdentifier'
      ) {
        throwVBRuntimeError('SYNTAX_ERROR');
      }
      const name = nameNode.children[0].text;
      return {
        name,
        type: 'named',
        value,
      } as NamedArg;
    } else {
      return {
        type: 'indexed',
        value: await evaluate(valueStmt, context),
      } as IndexedArg;
    }
  },

  async evaluateICS_S_MembersCall(node, context) {
    const { children } = node;

    if (children[0].symbol !== 'iCS_S_MemberCall') {
      const parent: VBAny | undefined = (context.parentMember = await evaluate(
        children[0],
        context,
      ));
      if (
        !parent ||
        (parent.type === 'Pointer' &&
          (await parent.getValue()).type === 'Empty') ||
        parent.type === 'Empty'
      ) {
        throwVBRuntimeError('UNEXPECTED_ERROR', 'member access');
      }
    }

    for (const c of children) {
      if (c.type === 'symbol' && c.symbol === 'iCS_S_MemberCall') {
        context.parentMember = await evaluate(c, context);
      }
    }

    let parent = context.parentMember;

    context.parentMember = undefined;

    const indexes = await buildIndexes(node, context);

    let v;
    if (parent && indexes.length) {
      v = await callSubOrGetElementWithIndexesAndArgs(
        parent,
        '',
        indexes,
        context,
      );
    } else {
      v = parent;
    }

    return v;
  },

  async evaluateICS_S_ProcedureOrArrayCall(node, context) {
    const args = await buildArgs(node, context);
    const indexes = await buildIndexes(node, context);
    return callSubOrGetElementWithIndexesAndArgs(
      context.parentMember,
      collectAmbiguousIdentifier(node, true)!,
      indexes,
      context,
      args,
    );
  },

  async evaluateICS_S_VariableOrProcedureCall({ children }, context) {
    const subName = children[0].children[0].text;
    const indexes = await buildIndexes({ children }, context);
    if (indexes.length || context.parentMember) {
      return callSubOrGetElementWithIndexesAndArgs(
        context.parentMember,
        subName,
        indexes,
        context,
      );
    } else {
      // variable
      return await context.getCurrentScopeInternal().getVariable(subName);
    }
  },
});
