import type {
  LetStmt_Node,
  AstTokenNode,
  ImplicitCallStmt_InStmt_Node,
  ValueStmt_Node,
} from '../../parser';
import type { Context } from '../Context';
import { VBValue, VBVariable } from '../types';
import { evaluators, evaluate } from './evaluators';

Object.assign(evaluators, {
  async evaluate_letStmt(node: LetStmt_Node, context: Context) {
    let { children } = node;
    let index = 0;
    let c: any = children[0];
    if (c.type === 'token') {
      ++index;
      c = children[index];
    }
    const left: ImplicitCallStmt_InStmt_Node = c;
    const op = children[++index] as AstTokenNode;
    const right = children[++index] as ValueStmt_Node;
    const leftObj = (await evaluate(left, context)) as VBVariable;
    const rightValue = (await evaluate(right, context)) as VBValue;
    if (op.token === 'EQ') {
      leftObj.value = rightValue;
    }
  },
});
